import {
    homeHref,
    identifiersHref,
    remotesHref,
    kfWitnessesHref,
    kfWatchersHref,
    settingsHref,
} from "./router.js";
import { menuButtonHtml } from "../shared/components.js";

function isCoreActive(routeName, target) {
    if (target === "identifiers") {
        return routeName === "identifiers" || routeName === "identifier-detail";
    }
    if (target === "remotes") {
        return routeName === "remotes" || routeName === "remote-detail";
    }
    return routeName === target;
}

function sidebarNav(route, vaultId) {
    const links = [
        {
            label: "Identifiers",
            icon: "./assets/icons/identifiers.png",
            href: identifiersHref(vaultId),
            active: isCoreActive(route.name, "identifiers"),
        },
        {
            label: "Remote Identifiers",
            icon: "./assets/icons/remoteIds.png",
            href: remotesHref(vaultId),
            active: isCoreActive(route.name, "remotes"),
        },
        {
            label: "Group Identifiers",
            icon: "./assets/icons/group.svg",
            disabled: true,
        },
        {
            label: "Credentials",
            icon: "./assets/icons/badge.svg",
            disabled: true,
        },
        {
            label: "Settings",
            icon: "./assets/icons/settings.png",
            href: settingsHref(vaultId),
            active: isCoreActive(route.name, "settings"),
        },
    ];
    const pluginLinks = [
        {
            label: "Witnesses",
            icon: "./assets/icons/witness1.svg",
            href: kfWitnessesHref(vaultId),
            active: route.name === "kf-witnesses",
        },
        {
            label: "Watchers",
            icon: "./assets/icons/watcher.svg",
            href: kfWatchersHref(vaultId),
            active: route.name === "kf-watchers",
        },
    ];

    return `
        <div class="lk-sidebar-shell" data-nav-shell>
            <nav class="lk-sidebar" aria-label="Vault navigation">
                <div class="lk-sidebar__nav">
                    ${links.map((link) => menuButtonHtml(link)).join("")}
                </div>
                <div class="lk-sidebar__plugin-block">
                    <div class="lk-sidebar__divider lk-sidebar__divider--plugin"></div>
                    <div class="lk-sidebar__plugin">
                        <a
                            class="lk-menu-btn lk-menu-btn--plugin ${route.navMode === "plugin" ? "is-active" : ""}"
                            href="${kfWitnessesHref(vaultId)}"
                            aria-current="${route.navMode === "plugin" ? "page" : "false"}"
                            aria-expanded="${route.navMode === "plugin" ? "true" : "false"}"
                        >
                        <img src="./assets/brand/SymbolLogo.svg" alt="" width="32" height="32">
                        <span class="lk-menu-btn__label">KERI Foundation</span>
                        </a>
                        <div
                            class="lk-sidebar__plugin-links ${route.navMode === "plugin" ? "is-open" : ""}"
                            role="group"
                            aria-label="KERI Foundation"
                            ${route.navMode === "plugin" ? "" : "hidden"}
                        >
                            ${pluginLinks.map((link) => menuButtonHtml(link)).join("")}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    `;
}

export function renderShell(root, { route, page, state, vault, actions }) {
    const isVaultShell = route.shellMode === "vault";

    const sidebarMarkup = isVaultShell && vault ? sidebarNav(route, vault.id) : "";
    const mobileNavOpen = Boolean(state?.mobileNavOpen);

    root.innerHTML = `
        <div class="shell">
            <header class="topbar">
                <div class="topbar__leading">
                    ${
                        isVaultShell
                            ? `
                                <button class="icon-button topbar__menu" data-action="toggle-nav" aria-label="Open navigation" aria-expanded="${mobileNavOpen ? "true" : "false"}">
                                    <img src="./assets/icons/menu.svg" alt="">
                                </button>
                            `
                            : ""
                    }
                    <a class="topbar__brand-link" href="${homeHref()}">
                        <img src="./assets/brand/SymbolLogo.svg" alt="">
                        <span class="topbar__title">Locksmith</span>
                    </a>
                </div>
                <div class="topbar__actions" role="toolbar" aria-label="Shell actions">
                    ${
                        isVaultShell && vault
                            ? `<button class="icon-button" type="button" aria-label="Notifications unavailable in this slice" disabled>
                                <img src="./assets/icons/notifications.svg" alt="">
                            </button>`
                            : ""
                    }
                    ${
                        isVaultShell && vault
                            ? `<a class="icon-button" href="${settingsHref(vault.id)}" aria-label="Settings">
                                <img src="./assets/icons/settings.svg" data-hover-src="./assets/icons/settings-hover.svg" alt="">
                            </a>`
                            : ""
                    }
                    ${
                        isVaultShell
                            ? ""
                            : `
                                <button class="icon-button" data-action="toggle-drawer" aria-label="Vaults">
                                    <img src="./assets/icons/vault-drawer.svg" data-hover-src="./assets/icons/vault-drawer-hover.svg" alt="">
                                </button>
                            `
                    }
                    ${
                        isVaultShell && vault
                            ? `
                                <button class="icon-button" data-action="lock-vault" aria-label="Lock vault">
                                    <img src="./assets/icons/lock.svg" data-hover-src="./assets/icons/lock-hover.svg" alt="">
                                </button>
                            `
                            : ""
                    }
                </div>
            </header>
            <div class="shell__body ${isVaultShell ? "shell__body--vault" : "shell__body--home"}">
                ${
                    isVaultShell && vault
                        ? `<button class="lk-sidebar-overlay ${mobileNavOpen ? "is-open" : ""}" type="button" data-action="close-nav" aria-label="Close navigation" data-nav-overlay></button>`
                        : ""
                }
                ${sidebarMarkup}
                <main class="shell__content">
                    <div class="shell__content-inner">
                        <div data-page-content></div>
                    </div>
                </main>
            </div>
        </div>
    `;

    const pageRoot = root.querySelector("[data-page-content]");
    pageRoot.replaceChildren();
    if (typeof page.render === "function") {
        page.render(pageRoot);
    } else {
        pageRoot.innerHTML = page.html;
    }
    document.title = `${page.title} | Locksmith`;

    // Toggle mobile nav (for responsive sidebar)
    root.querySelectorAll("[data-action='toggle-nav']").forEach((button) => {
        button.addEventListener("click", () => actions.toggleNav());
    });
    root.querySelectorAll("[data-action='close-nav']").forEach((button) => {
        button.addEventListener("click", () => actions.closeNav());
    });

    root.querySelectorAll("[data-nav-shell]").forEach((nav) => {
        nav.classList.toggle("is-open", mobileNavOpen);
    });

    root.querySelectorAll("[data-hover-src]").forEach((img) => {
        const defaultSrc = img.getAttribute("src");
        const hoverSrc = img.dataset.hoverSrc;
        const button = img.closest(".icon-button");
        if (!defaultSrc || !hoverSrc || !button || button.matches("[disabled]")) {
            return;
        }

        button.addEventListener("mouseenter", () => {
            img.setAttribute("src", hoverSrc);
        });
        button.addEventListener("mouseleave", () => {
            img.setAttribute("src", defaultSrc);
        });
        button.addEventListener("focus", () => {
            img.setAttribute("src", hoverSrc);
        });
        button.addEventListener("blur", () => {
            img.setAttribute("src", defaultSrc);
        });
    });

    // Vault drawer toggle
    root.querySelectorAll("[data-action='toggle-drawer']").forEach((button) => {
        button.addEventListener("click", () => actions.toggleDrawer?.());
    });

    // Lock vault
    root.querySelectorAll("[data-action='lock-vault']").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!vault) return;
            await actions.lockVault(vault.id);
        });
    });

    page.setup?.(pageRoot);
}
