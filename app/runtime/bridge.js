import { PyWorker } from "../../vendor/pyscript/2025.11.2/core.js";
import { parse as parseToml } from "../../vendor/pyscript/2025.11.2/toml-BK2RWy-G.js";
import { createRuntimeRequest, isRuntimeResponse } from "./messages.js";

function withTimeout(promise, timeoutMs, method) {
    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            const error = new Error(`Runtime request timed out for ${method}.`);
            error.code = "TIMEOUT";
            reject(error);
        }, timeoutMs);

        promise.then(
            (value) => {
                clearTimeout(timeoutId);
                resolve(value);
            },
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            },
        );
    });
}

function parseRuntimeResponse(rawResponse) {
    const payload =
        typeof rawResponse === "string"
            ? rawResponse
            : rawResponse?.data ?? rawResponse;

    if (typeof payload !== "string") {
        return payload;
    }

    try {
        return JSON.parse(payload);
    } catch (error) {
        const wrapped = new Error("Runtime worker returned a malformed response.");
        wrapped.code = "BAD_RESPONSE";
        wrapped.cause = error;
        throw wrapped;
    }
}

export function createRuntimeBridge({ workerUrl, configUrl }) {
    const workerPromise = (async () => {
        const response = await fetch(configUrl.toString());
        if (!response.ok) {
            throw new Error(`Unable to load runtime config from ${configUrl.toString()}.`);
        }

        const config = parseToml(await response.text());
        return PyWorker(workerUrl.toString(), {
            type: "pyodide",
            configURL: configUrl.toString(),
            config,
        });
    })();
    let requestCounter = 0;
    let bootedWorker = null;

    async function getWorker(timeoutMs) {
        if (bootedWorker) {
            return bootedWorker;
        }

        bootedWorker = await withTimeout(workerPromise, timeoutMs, "worker boot");
        return bootedWorker;
    }

    async function rawRequest(rawPayload, timeoutMs = 30_000, label = "raw runtime request") {
        if (typeof rawPayload !== "string") {
            throw new Error("Runtime raw request payload must be a string.");
        }

        const worker = await getWorker(timeoutMs);
        const rawResponse = await withTimeout(worker.sync.handle_request(rawPayload), timeoutMs, label);
        return parseRuntimeResponse(rawResponse);
    }

    async function request(method, params = {}, timeoutMs = 30_000) {
        const id = `runtime-${Date.now()}-${requestCounter++}`;
        const payload = JSON.stringify(createRuntimeRequest(id, method, params));
        const response = await rawRequest(payload, timeoutMs, method);

        if (!isRuntimeResponse(response) || response.id !== id) {
            const error = new Error("Runtime worker returned an invalid response.");
            error.code = "BAD_RESPONSE";
            throw error;
        }

        if (response.ok) {
            return response.result;
        }

        const error = new Error(response.error?.message || "Runtime request failed.");
        error.code = response.error?.code || "RUNTIME_ERROR";
        throw error;
    }

    return {
        request,
        rawRequest,
        destroy() {
            void workerPromise.then((worker) => {
                worker.terminate?.();
            });
        },
    };
}
