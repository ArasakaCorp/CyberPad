import { fileNameFromPath } from "../ui/state.js";
import { updateCharCount } from "./counter.js";
import { closeDrawer } from "./drawer.js";

export function syncSaveState(dom, state) {
    dom.menuSave.disabled = !(state.currentFilePath && state.dirty);
}

export function applyOpenedFile(dom, state, res) {
    if (!res?.filePath) return;

    state.currentFilePath = res.filePath;
    state.dirty = false;

    dom.topFile.textContent = fileNameFromPath(res.filePath);
    dom.editor.value = res.content ?? "";
    updateCharCount(dom);

    syncSaveState(dom, state);
}

export function showSavedIndicator(dom) {
    const original = dom.topFile.textContent;

    dom.topFile.textContent = "SAVED";
    dom.topFile.classList.add("saved");

    setTimeout(() => {
        dom.topFile.textContent = original;
        dom.topFile.classList.remove("saved");
    }, 700);
}

export function initWindowButtons(dom) {
    dom.minBtn.addEventListener("click", () => window.api.minimize());
    dom.closeBtn.addEventListener("click", () => window.api.close());
}

export function initOpenSave(dom, state, { onOpened }) {
    dom.menuOpen.addEventListener("click", async () => {
        closeDrawer(dom);
        const res = await window.api.openFile();
        if (!res) return;
        applyOpenedFile(dom, state, res);
        onOpened?.(res.filePath);
    });

    dom.menuSave.addEventListener("click", async () => {
        if (!(state.currentFilePath && state.dirty)) return;
        closeDrawer(dom);

        dom.menuSave.disabled = true;
        const res = await window.api.saveFile(state.currentFilePath, dom.editor.value);

        if (res?.ok) {
            state.dirty = false;
            showSavedIndicator(dom);
        }
        syncSaveState(dom, state);
    });

    dom.menuSaveAs.addEventListener("click", async () => {
        closeDrawer(dom);

        const suggestedName = state.currentFilePath
            ? fileNameFromPath(state.currentFilePath)
            : "NOTE.txt";

        dom.menuSaveAs.disabled = true;
        const res = await window.api.saveAs(suggestedName, dom.editor.value);
        dom.menuSaveAs.disabled = false;
        if (!res?.filePath) return;

        applyOpenedFile(dom, state, { filePath: res.filePath, content: dom.editor.value });
        showSavedIndicator(dom);
        onOpened?.(res.filePath);
    });

    // File association / Open with
    window.api?.onFileOpened?.((res) => {
        closeDrawer(dom);
        applyOpenedFile(dom, state, res);
        onOpened?.(res.filePath);
    });

    // dirty tracking (базовое)
    dom.editor.addEventListener("input", () => {
        if (!state.currentFilePath) return;
        state.dirty = true;
        syncSaveState(dom, state);
    });

    dom.menuNew.addEventListener("click", () => {
        closeDrawer(dom);
        newNote(dom, state);
    });

    function newNote(dom, state) {
        // сброс состояния документа
        state.currentFilePath = null;
        state.dirty = false;

        // UI
        dom.topFile.textContent = "UNTITLED";
        dom.editor.value = "";
        updateCharCount(dom);

        // кнопки
        syncSaveState(dom, state);
    }

}
