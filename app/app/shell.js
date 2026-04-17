import {
    identifiersHref,
    remotesHref,
    kfWitnessesHref,
    kfWatchersHref,
    settingsHref,
} from "./router.js";

function isRouteActive(routeName, target) {
    if (target === "identifiers") {
        return routeName === "identifiers" || routeName === "identifier-detail";
    }
    if (target === "remotes") {
        return routeName === "remotes" || routeName === "remote-detail";
    }
    if (target === "foundation") {
        return routeName === "kf-witnesses" || routeName === "kf-watchers";
    }
    return routeName === target;
}

function shellTabs(route, vaultId) {
    const links = [
        {
            label: "Identifiers",
            href: identifiersHref(vaultId),
            active: isRouteActive(route.name, "identifiers"),
        },
        {
            label: "Remotes",
            href: remotesHref(vaultId),
            active: isRouteActive(route.name, "remotes"),
        },
        {
            label: "Foundation",
            href: kfWitnessesHref(vaultId),
            active: isRouteActive(route.name, "foundation"),
        },
        {
            label: "Settings",
            href: settingsHref(vaultId),
            active: isRouteActive(route.name, "settings"),
        },
    ];

    return `
        <nav class="shell-tabbar" aria-label="Vault navigation">
            ${links.map((link) => `
                <a class="shell-tabbar__link ${link.active ? "is-active" : ""}" href="${link.href}" aria-current="${link.active ? "page" : "false"}">
                    <span>${link.label}</span>
                </a>
            `).join("")}
        </nav>
    `;
}

function sectionTabs(route, vaultId) {
    if (route.name !== "kf-witnesses" && route.name !== "kf-watchers") {
        return "";
    }

    const links = [
        {
            label: "Witnesses",
            href: kfWitnessesHref(vaultId),
            active: route.name === "kf-witnesses",
        },
        {
            label: "Watchers",
            href: kfWatchersHref(vaultId),
            active: route.name === "kf-watchers",
        },
    ];

    return `
        <nav class="shell-section-tabs" aria-label="Foundation navigation">
            ${links.map((link) => `
                <a class="shell-section-tabs__link ${link.active ? "is-active" : ""}" href="${link.href}" aria-current="${link.active ? "page" : "false"}">
                    ${link.label}
                </a>
            `).join("")}
        </nav>
    `;
}

export function renderShell(root, { route, page, state, vault, actions }) {
    const isVaultShell = route.shellMode === "vault" && vault;

    root.innerHTML = `
        <div class="shell ${isVaultShell ? "shell--vault" : "shell--home"}">
            ${isVaultShell ? `
                <header class="shell-header">
                    <div class="shell-header__leading">
                        <p class="shell-header__eyebrow">${vault.alias}</p>
                        <h1 class="shell-header__title">${page.title}</h1>
                    </div>
                    <div class="shell-header__actions" role="toolbar" aria-label="Vault actions">
                        <button class="button button--ghost shell-header__vault-button" type="button" data-action="toggle-drawer">Vaults</button>
                        <button class="icon-button shell-header__icon" data-action="lock-vault" aria-label="Lock vault">
                            <img src="./assets/icons/lock.svg" alt="">
                        </button>
                    </div>
                </header>
            ` : ""}
            <div class="shell__body ${isVaultShell ? "shell__body--vault" : "shell__body--home"}">
                <main class="shell__content ${isVaultShell ? "shell__content--vault" : "shell__content--home"}">
                    <div class="shell__content-inner">
                        ${isVaultShell ? sectionTabs(route, vault.id) : ""}
                        <div data-page-content></div>
                    </div>
                </main>
            </div>
            ${isVaultShell ? shellTabs(route, vault.id) : ""}
        </div>
    `;

    const pageRoot = root.querySelector("[data-page-content]");
    pageRoot.replaceChildren();
    if (typeof page.render === "function") {
        page.render(pageRoot);
    } else {
        pageRoot.innerHTML = page.html;
    }
    document.title = `${page.title} | Fort`;

    root.querySelectorAll("[data-action='toggle-drawer']").forEach((button) => {
        button.addEventListener("click", () => actions.toggleDrawer?.());
    });

    root.querySelectorAll("[data-action='lock-vault']").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!vault) return;
            await actions.lockVault(vault.id);
        });
    });

    page.setup?.(pageRoot);
}
