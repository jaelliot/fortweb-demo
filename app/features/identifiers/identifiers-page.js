import { identifierDetailHref } from "../../app/router.js";
import {
    createDialog,
    floatingInputHtml,
    renderPaginatedTable,
    setupFloatingInputs,
} from "../../shared/components.js";
import { escapeHtml } from "../../shared/dom.js";

function createIdentifierDialog(onCreateIdentifier) {
    const dialog = createDialog({
        title: "Create Identifier",
        showClose: true,
        showDivider: true,
        content: `
            <form class="lk-form-stack" data-create-identifier-form>
                ${floatingInputHtml({ label: "Alias", name: "alias" })}
                <p class="status-line" data-create-identifier-status></p>
            </form>
        `,
        buttons: `
            <button class="button button--secondary" type="button" data-dialog-cancel>Cancel</button>
            <button class="button button--primary" type="button" data-dialog-submit>Create</button>
        `,
        showOverlay: false,
    });

    dialog.show();
    setupFloatingInputs(dialog.el);

    const form = dialog.el.querySelector("[data-create-identifier-form]");
    const statusLine = dialog.el.querySelector("[data-create-identifier-status]");
    const submitBtn = dialog.el.querySelector("[data-dialog-submit]");
    const cancelBtn = dialog.el.querySelector("[data-dialog-cancel]");

    cancelBtn.addEventListener("click", () => dialog.close());

    async function submit() {
        const formData = new FormData(form);
        submitBtn.disabled = true;
        statusLine.textContent = "";

        try {
            await onCreateIdentifier(String(formData.get("alias") || ""));
            dialog.close();
        } catch (error) {
            submitBtn.disabled = false;
            statusLine.textContent = error.message || "Identifier creation failed.";
        }
    }

    submitBtn.addEventListener("click", submit);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        submit();
    });
}

export function renderIdentifiersPage({ vault, identifiers, onCreateIdentifier }) {
    const identifierRows = identifiers.map((identifier) => ({
        alias: identifier.alias,
        aliasLink: `<a href="${identifierDetailHref(vault.id, identifier.aid)}">${escapeHtml(identifier.alias)}</a>`,
        prefix: identifier.prefix,
        sequenceNumber: identifier.sequenceNumber,
        witnessSummary: identifier.witnessSummary,
        lastEventDigest: identifier.lastEventDigest,
        _raw: identifier,
    }));

    const identifierTable = renderPaginatedTable({
        icon: "./assets/icons/identifiers.png",
        title: "Local Identifiers",
        titleTag: "h1",
        searchPlaceholder: "Search...",
        addButtonText: "Add Identifier",
        columns: [
            { key: "aliasLink", label: "Alias", width: "220px", searchKey: "alias", html: true },
            { key: "prefix", label: "Prefix", width: "310px" },
            { key: "sequenceNumber", label: "Seq No.", width: "110px" },
            { key: "witnessSummary", label: "Witnesses", width: "160px" },
            { key: "lastEventDigest", label: "Last Event SAID", width: "280px" },
        ],
        rows: identifierRows,
        rowActions: [{ key: "view", label: "View", icon: "./assets/icons/browse.svg" }],
        itemsPerPage: 10,
        emptyTitle: "No Local Identifiers Yet",
        emptyText: "Create a local identifier from this route to persist browser-safe AID state in the selected vault.",
        onAdd() {
            createIdentifierDialog(onCreateIdentifier);
        },
        onAction(row, actionKey) {
            if (actionKey === "view") {
                window.location.hash = identifierDetailHref(vault.id, row._raw.aid);
            }
        },
    });

    return {
        title: "Identifiers",
        render(container) {
            container.replaceChildren();

            const page = document.createElement("section");
            page.className = "page-grid page-grid--table";

            const section = document.createElement("section");
            section.className = "section-card section-card--tight page-table-stage";

            const tableRoot = document.createElement("div");
            tableRoot.dataset.identifiersTable = "true";
            tableRoot.innerHTML = identifierTable.html;

            section.append(tableRoot);
            page.append(section);
            container.append(page);
        },
        setup(root) {
            identifierTable.setup(root.querySelector("[data-identifiers-table]"));
        },
    };
}
