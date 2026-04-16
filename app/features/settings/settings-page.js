function enabledLabel(value) {
    return value ? "Enabled" : "Disabled";
}

function detailItem(label, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "detail-item";

    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = value;

    wrapper.append(term, description);
    return wrapper;
}

export function renderSettingsPage({ vault, settings }) {
    return {
        title: "Settings",
        render(container) {
            container.replaceChildren();

            const page = document.createElement("section");
            page.className = "page-grid page-grid--settings";

            const header = document.createElement("header");
            header.className = "page-header";

            const headingBlock = document.createElement("div");

            const eyebrow = document.createElement("p");
            eyebrow.className = "page-header__eyebrow";
            eyebrow.textContent = vault.alias;

            const title = document.createElement("h1");
            title.textContent = "Settings";

            const copy = document.createElement("p");
            copy.textContent =
                "This page stays limited to persisted browser-vault defaults and runtime facts. Desktop browser-plugin settings are intentionally not carried into Fortweb.";

            headingBlock.append(eyebrow, title, copy);
            header.append(headingBlock);

            const columns = document.createElement("section");
            columns.className = "page-columns";

            const defaultsCard = document.createElement("section");
            defaultsCard.className = "section-card settings-panel";

            const defaultsTitle = document.createElement("h2");
            defaultsTitle.textContent = "Vault Defaults";

            const defaultsGrid = document.createElement("dl");
            defaultsGrid.className = "detail-grid";
            defaultsGrid.append(
                detailItem("Vault", vault.alias),
                detailItem("Temporary Datastore", enabledLabel(settings.tempDatastore)),
                detailItem("Key Algorithm", settings.keyAlgorithm),
                detailItem("Key Tier", settings.keyTier),
                detailItem("Witness Profile", settings.witnessProfile),
            );

            defaultsCard.append(defaultsTitle, defaultsGrid);

            const runtimeCard = document.createElement("section");
            runtimeCard.className = "section-card settings-panel";

            const runtimeTitle = document.createElement("h2");
            runtimeTitle.textContent = "Storage and Runtime";

            const runtimeGrid = document.createElement("dl");
            runtimeGrid.className = "detail-grid";
            runtimeGrid.append(
                detailItem("Storage Backend", settings.storageBackend),
                detailItem("Runtime Status", settings.runtimeStatus),
            );

            runtimeCard.append(runtimeTitle, runtimeGrid);
            columns.append(defaultsCard, runtimeCard);

            const dangerZone = document.createElement("section");
            dangerZone.className = "section-card danger-zone settings-panel settings-panel--danger";

            const dangerTitle = document.createElement("h2");
            dangerTitle.textContent = "Danger Zone";

            const dangerCopy = document.createElement("p");
            dangerCopy.className = "muted";
            dangerCopy.textContent = "Vault deletion is still deferred until the product has a real destructive-action contract.";

            const actions = document.createElement("div");
            actions.className = "panel__actions";

            const deleteButton = document.createElement("button");
            deleteButton.className = "button button--danger";
            deleteButton.type = "button";
            deleteButton.disabled = true;
            deleteButton.textContent = "Delete Vault";

            actions.append(deleteButton);
            dangerZone.append(dangerTitle, dangerCopy, actions);

            page.append(header, columns, dangerZone);
            container.append(page);
        },
    };
}
