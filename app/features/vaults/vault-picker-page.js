import { formatDateLabel } from "../../shared/dom.js";

function buildMetaItem(label, value) {
    const item = document.createElement("div");
    item.className = "summary-item";

    const itemLabel = document.createElement("span");
    itemLabel.textContent = label;

    const itemValue = document.createElement("span");
    itemValue.textContent = value;

    item.append(itemLabel, itemValue);
    return item;
}

function buildVaultCard(vault, onSelectVault) {
    const card = document.createElement("article");
    card.className = "vault-card vault-card--mobile-home";

    const header = document.createElement("div");
    header.className = "vault-card__header";

    const titleBlock = document.createElement("div");
    titleBlock.className = "vault-card__title";

    const title = document.createElement("h2");
    title.textContent = vault.alias;

    const copy = document.createElement("p");
    copy.className = "muted";
    copy.textContent = vault.storageName || "Browser-safe vault";

    titleBlock.append(title, copy);

    const badge = document.createElement("span");
    badge.className = vault.locked === false ? "badge badge--success" : "badge badge--neutral";
    badge.textContent = vault.locked === false ? "Open" : "Locked";

    header.append(titleBlock, badge);

    const meta = document.createElement("div");
    meta.className = "summary-grid vault-card__meta vault-card__meta--mobile";
    meta.append(
        buildMetaItem("Created", formatDateLabel(vault.createdAt)),
        buildMetaItem("Identifiers", String(vault.identifierCount ?? 0)),
        buildMetaItem("Remotes", String(vault.remoteCount ?? 0)),
    );

    const actions = document.createElement("div");
    actions.className = "vault-card__actions";

    const button = document.createElement("button");
    button.className = "button button--primary vault-card__primary-action";
    button.type = "button";
    button.textContent = vault.locked === false ? "Return to Vault" : "Open Vault";
    button.addEventListener("click", () => onSelectVault(vault));

    actions.append(button);
    card.append(header, meta, actions);
    return card;
}

export function renderVaultPickerPage({ vaults = [], onCreateVault, onSelectVault }) {
    return {
        title: "Vaults",
        render(container) {
            container.replaceChildren();

            const page = document.createElement("section");
            page.className = "page-grid vault-home";

            const hero = document.createElement("section");
            hero.className = "hero-card vault-home__hero";
            hero.innerHTML = `
                <div class="hero-card__brand vault-home__brand">
                    <img src="./assets/brand/SymbolLogo.svg" alt="" aria-hidden="true">
                    <p class="hero-card__eyebrow">On-Device Wallet</p>
                    <h1>Your Vaults</h1>
                    <p>Create a vault or reopen one you have already stored on this device.</p>
                </div>
            `;

            const heroActions = document.createElement("div");
            heroActions.className = "hero-card__actions";

            const createButton = document.createElement("button");
            createButton.className = "button button--primary";
            createButton.type = "button";
            createButton.textContent = "Create Vault";
            createButton.addEventListener("click", () => onCreateVault());
            heroActions.append(createButton);
            hero.append(heroActions);

            const vaultsPanel = document.createElement("section");
            vaultsPanel.className = "panel vault-home__list-panel";

            const panelHeader = document.createElement("div");
            panelHeader.className = "panel__header vault-home__list-header";

            const heading = document.createElement("div");
            heading.className = "panel__title";

            const headingTitle = document.createElement("h2");
            headingTitle.textContent = "Available Vaults";

            const headingCopy = document.createElement("p");
            headingCopy.className = "muted";
            headingCopy.textContent = vaults.length
                ? "Choose a vault to continue your local wallet session."
                : "Create your first vault to begin using the mobile wallet.";

            heading.append(headingTitle, headingCopy);
            panelHeader.append(heading);
            vaultsPanel.append(panelHeader);

            if (!vaults.length) {
                const empty = document.createElement("div");
                empty.className = "empty-state vault-home__empty";
                empty.innerHTML = `
                    <h2>No Vaults Yet</h2>
                    <p>This wallet has not created a local vault on this device yet.</p>
                `;
                vaultsPanel.append(empty);
            } else {
                const list = document.createElement("div");
                list.className = "vault-list vault-home__list";
                vaults.forEach((vault) => list.append(buildVaultCard(vault, onSelectVault)));
                vaultsPanel.append(list);
            }

            page.append(hero, vaultsPanel);
            container.append(page);
        },
    };
}
