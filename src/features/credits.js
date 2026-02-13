export async function initCredits(dom, state, opts = {}) {
    const {
        author = "Nutcracker",
        sponsor = "ArasakaCorp",
        url = "https://github.com/ArasakaCorp/CyberPad",
        productName = "CyberPad",
    } = opts;

    const creditsText = document.getElementById("creditsText");
    const creditsLink = document.getElementById("creditsLink");
    if (!creditsText || !creditsLink) return;

    const version = await window.api.getAppVersion?.().catch(() => "");
    const versionPart = version ? ` v${version}` : "";

    creditsText.textContent =
        `${productName}${versionPart} • by ${author}  •  ${sponsor} • `;

    creditsLink.onclick = (e) => {
        e.preventDefault();
        window.api.openExternal?.(url);
    };
}