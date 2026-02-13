import { applyOpenedFile } from "./fileActions.js";
import { closeDrawer } from "./drawer.js";

export function initDragDrop(dom, state, { onOpened } = {}) {
    const hud = document.querySelector(".hud.panel");
    let dragDepth = 0;

    console.log("[DND] mounted", { hasHud: !!hud, hasApi: !!window.api });

    const prevent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    function setDragUI(on) {
        if (!hud) return;
        hud.classList.toggle("dragging", on);
    }

    // CAPTURE = true, чтобы ловить события раньше любых “drag region” слоёв
    document.addEventListener("dragenter", (e) => {
        prevent(e);
        dragDepth++;
        setDragUI(true);
        // console.log("[DND] dragenter");
    }, true);

    document.addEventListener("dragover", (e) => {
        prevent(e);
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    }, true);

    document.addEventListener("dragleave", (e) => {
        prevent(e);
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) setDragUI(false);
    }, true);

    document.addEventListener("drop", async (e) => {
        prevent(e);
        dragDepth = 0;
        setDragUI(false);

        const files = Array.from(e.dataTransfer?.files || []);
        const file = files[0];
        let filePath = file?.path; // если вдруг есть
        if (!filePath && window.api?.getPathForFile && file) {
            filePath = window.api.getPathForFile(file);
        }
        console.log("[DND] files", files);
        console.log("[DND] drop", files.map(f => ({ name: f.name, path: f.path })));

        if (!filePath) return;

        // Если ты случайно тестишь в обычном браузере (не Electron), api будет отсутствовать
        if (!window.api?.openPath) {
            console.warn("[DND] window.api.openPath missing (not Electron window)");
            return;
        }

        closeDrawer(dom);

        const res = await window.api.openPath(filePath);
        if (!res) return;

        applyOpenedFile(dom, state, res);
        onOpened?.(res.filePath);
    }, true);
}