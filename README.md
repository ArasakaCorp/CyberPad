# CyberPad

Minimalist industrial notepad for people who prefer terminals over toys.

CyberPad is a lightweight, frameless, transparent Electron editor designed to feel like a small system utility rather than a traditional application.  
Fast launch, zero clutter, keyboard-first, and built with a cyber‑industrial HUD aesthetic.

Inspired by the **Memory Shards** interface from *Cyberpunk 2077* — small, floating, diegetic data panels that feel like hardware rather than software.

Think: firmware tool, not IDE.

---

## ✦ Inspiration

CyberPad’s design language is directly inspired by:

- Memory Shards UI from *Cyberpunk 2077*
- industrial terminals
- embedded devices
- transparent HUD overlays
- “always-on-side” utility tools

The goal was to create something that feels like a **piece of equipment**, not a windowed app.

Subtle glow.  
Sharp edges.  
Minimal chrome.  
Maximum focus.

---

## ✦ Features

- Frameless transparent HUD window
- Drag & Drop file opening
- Open / Save / Save As
- Autosave indicator
- Undo / Redo history stack
- Character counter
- Recent files list
- Slide‑out drawer menu
- Portable executable (no installer required)
- Extremely small footprint
- No frameworks, no React, no bloat

---

## ✦ Tech Stack

- Electron 40+
- Vite
- Vanilla JavaScript
- Custom CSS HUD styling
- Zero UI frameworks

Architecture philosophy:

> small modules > big frameworks

```
src/
  ui/
  features/
  services/
electron/
  main.js
  preload.js
```

Feature‑based design.  
Each capability lives in its own isolated module (`autosave`, `drawer`, `history`, `dragDrop`, `credits`, etc.).

---

## ✦ Development

### Install
```bash
npm install
```

### Run (dev)
```bash
npm run dev
```

- Vite handles renderer hot reload
- Electron restarts when main/preload changes

### Build
```bash
npm run build
npm start
```

### Portable exe
```bash
npm run dist
```

---

## ✦ Drag & Drop

Drop any `.txt`, `.md`, or plain text file directly onto the window.

Works in both:
- development
- production builds

---

## ✦ Philosophy

CyberPad intentionally avoids:

- heavy frameworks
- complex state managers
- visual noise
- unnecessary UI

It aims to behave like:

> a small system console you keep on the side of your screen

Fast. Focused. Disposable. Reliable.

---

## ✦ Credits

CyberPad  
by Nutckracker  
For all cyberpunkers out there. 
Sponsored by ArasakaCorp  

GitHub: https://github.com/ArasakaCorp/CyberPad

---

## ✦ AI Assistance

Parts of the architecture, refactoring, feature implementation, and documentation were developed with assistance from **ChatGPT (OpenAI)** using the **GPT‑5 model family** as an engineering copilot.

The AI was used for:
- architecture planning
- module design
- refactoring suggestions
- UI/UX ideas
- documentation generation

All final decisions, integration, and testing were performed manually.

---

## ✦ License

MIT

Do whatever you want.  
Ship it. Modify it. Break it. Rebuild it.

---

## ✦ Why

Because sometimes you just want:

a small glowing window  
floating over everything  
waiting for thoughts.

Not an IDE.  
Not a browser tab.  
Just a tool.
