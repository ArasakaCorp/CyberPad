import "./style.css";
import iconUrl from "./assets/icons/icon.png";

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="hud panel">
    <div class="noise"></div>
    <div class="hud-deco" aria-hidden="true"></div>

    <!-- Левая вертикальная кнопка/рейка OPEN (без текста) -->
    <button id="openBtn" class="rail-btn" title="Open file"></button>

    <section class="content">
      <header class="header drag">
        <div class="header-title">
          <span class="chip-icon">
              <img src="${iconUrl}" alt="">
          </span>
          <span id="topFile" class="header-value">NONE</span>
        </div>

        <div class="header-actions no-drag">
          <button id="minBtn" class="wbtn min" title="Minimize">_</button>
          <button id="closeBtn" class="wbtn close" title="Close">X</button>
        </div>
      </header>
      
      <div id="drawer" class="drawer" aria-hidden="true">
          <div class="drawer-inner">
<!--            <div class="drawer-title"></div>-->
        
            <button id="menuOpen" class="menu-item">OPEN</button>
            <button id="menuSave" class="menu-item" disabled>SAVE</button>
            <button id="menuSaveAs" class="menu-item" disabled>SAVE AS…</button>
        
            <div class="drawer-hint">Click rail to close</div>
          </div>
      </div>

      <div class="body">
        <textarea id="editor" spellcheck="false" placeholder="Open a file to begin..."></textarea>
        <div id="charCount" class="char-count" aria-hidden="true">000000</div>
      </div>
    </section>
  </div>
`;

// UI Selectors
const minBtn = document.querySelector("#minBtn");
const closeBtn = document.querySelector("#closeBtn");
const editor = document.querySelector("#editor");
const topFile = document.querySelector("#topFile");
const railBtn = document.querySelector("#openBtn");
const drawer = document.querySelector("#drawer");
const menuOpen = document.querySelector("#menuOpen");
const menuSave = document.querySelector("#menuSave");
const menuSaveAs = document.querySelector("#menuSaveAs");

menuSave.disabled = false;
menuSaveAs.disabled = false;

//Global variables
let currentFilePath = null;
let dirty = false;

function syncSaveState() {
    menuSave.disabled = !(currentFilePath && dirty);
}

syncSaveState();

minBtn.addEventListener("click", () => window.api.minimize());
closeBtn.addEventListener("click", () => window.api.close());



railBtn.addEventListener("click", () => {
    drawer.classList.toggle("open");
    railBtn.classList.toggle("active");
});


menuOpen.addEventListener("click", async () => {
    drawer.classList.remove("open");
    railBtn.classList.remove("active");

    const res = await window.api.openFile();
    if (!res) return;

    const justName = res.filePath.split(/[/\\]/).pop();
    currentFilePath = res.filePath;
    dirty = false;
    syncSaveState();

    topFile.textContent = justName;
    editor.value = res.content;
    updateCharCount();
});

menuSave.addEventListener("click", async () => {
    if (!(currentFilePath && dirty)) return;

    drawer.classList.remove("open");
    railBtn.classList.remove("active");

    const content = editor.value;

    menuSave.disabled = true; // чтобы не спамили кликом
    const res = await window.api.saveFile(currentFilePath, content);

    if (res?.ok) {
        dirty = false;
        showSavedIndicator();
    }
    syncSaveState();
});

editor.addEventListener("input", () => {
    if (!currentFilePath) return; // если файл не открыт — Save не нужен
    dirty = true;
    syncSaveState();
});

function showSavedIndicator() {
    const original = topFile.textContent;

    topFile.textContent = "SAVED";
    topFile.classList.add("saved");

    setTimeout(() => {
        topFile.textContent = original;
        topFile.classList.remove("saved");
    }, 700);
}

menuSaveAs.addEventListener("click", async () => {
    drawer.classList.remove("open");
    railBtn.classList.remove("active");

    const content = editor.value;

    // предложим имя: если файл уже открыт — то же имя, иначе NOTE.txt
    const suggestedName = currentFilePath
        ? currentFilePath.split(/[/\\]/).pop()
        : "NOTE.txt";

    // чтобы не спамили кликом
    menuSaveAs.disabled = true;
    const res = await window.api.saveAs(suggestedName, content);
    menuSaveAs.disabled = false;

    if (!res?.filePath) return;

    currentFilePath = res.filePath;
    const justName = currentFilePath.split(/[/\\]/).pop();
    topFile.textContent = justName;

    dirty = false;
    syncSaveState();
    showSavedIndicator();
});

window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        menuSaveAs.click();
    }
});

const charCountEl = document.querySelector("#charCount");

function updateCharCount() {
    const n = editor.value.length; // включает пробелы и переносы строк
    charCountEl.textContent = String(n).padStart(6, "0");
}

editor.addEventListener("input", updateCharCount);
updateCharCount();