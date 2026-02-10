export function initShortcuts(dom) {
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            dom.menuSaveAs.click();
        }
    });
}
