# KancilJS 🐭⚡

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </a>
  <a href="https://github.com/pinoruswana/kanciljs">
    <img src="https://img.shields.io/badge/github-pinoruswana/kanciljs-blue?logo=github" alt="GitHub Repo">
  </a>
  <a href="https://github.com/pinoruswana/kanciljs/releases">
    <img src="https://img.shields.io/badge/version-0.1.0-orange" alt="Version">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/made%20with-JavaScript-blue?logo=javascript" alt="JS Library">
  </a>
  <a href="https://bundlephobia.com/package/kanciljs">
    <img src="https://img.shields.io/bundlephobia/min/kanciljs?label=min+size" alt="Bundle Size">
  </a>

  <a href="https://www.npmjs.com/package/kanciljs" target="_blank" rel="noopener">
  <img src="https://img.shields.io/npm/v/kanciljs" alt="NPM Version">
</a>

<a href="https://stackblitz.com/github/pinoruswana/kanciljs-demo" target="_blank" rel="noopener">
  <img src="https://img.shields.io/badge/StackBlitz-Live-blue?logo=stackblitz" alt="Open in StackBlitz">
</a>

</p>

**A fast and lightweight frontend library for reactive components without the complexity.**

> "KancilJS is a minimal solution to build reactive UI without heavyweight frameworks."

---

## ✨ Features

- 🔄 **Reactive State Binding** using `{{variable}}` directly in HTML
- 🧩 **Simple Component** architecture (no class inheritance needed)
- 🖱️ **Event Binding** with HTML attributes like `@click`, `@input`, `@change`, `@keyup`, etc.
- 💾 **Automatic localStorage persistence** using `storeKey`
- 🔍 **Auto re-render** on state updates
- 🔥 **Composable and lightweight**, ideal for small to medium projects

---

## 📦 Installation

### From GitHub (not yet on npm)

```bash
npm install pinoruswana/kanciljs
```

### Import it in your browser:

```js
import { KancilComponent } from './node_modules/kanciljs/src/kancil.js';
```

---

## 🚀 Usage Example

### 1. Initialize Component

```html
<div id="app">
    <h1>Hello {{name}}</h1>
    <input type="text" @input="name" />
    <button @click="count++">Click {{count}}</button>
</div>

<script type="module">
    import { KancilComponent } from './node_modules/kanciljs/src/kancil.js';

    new KancilComponent({
        target: '#app',
        state: {
            name: 'Kancil Boss',
            count: 0,
        },
    });
</script>
```

### 2. Enable Persistence with `storeKey`

```js
new KancilComponent({
    target: '#app',
    state: {
        name: '',
        count: 0,
    },
    storeKey: 'kancil-store',
});
```

> State will be automatically saved and loaded from localStorage.

---

## 🧠 Reactive State

- Bind values in HTML using `{{variable}}`
- Inputs are auto-bound via `@input`
- State updates (e.g. `state.count++`) will trigger re-render

---

## ⚡ Event Binding

Use `@event="expression"` directly in HTML:

| Attribute | Description                           |
| --------- | ------------------------------------- |
| `@click`  | When clicked                          |
| `@input`  | On input change                       |
| `@change` | On value change (select, radio, etc.) |
| `@keyup`  | On key release (supports filters)     |

Example:

```html
<input @keyup="name = $el.value" />
```

`$el` refers to the element that triggered the event.

---

## 🔒 Cursor and Focus Handling

KancilJS automatically restores the cursor position and element focus after re-renders during input.

---

## 💾 Auto localStorage Integration

When `storeKey` is defined, state will persist using `localStorage`. No manual handling required.

---

## 🧪 Extra Tips

- Use `$el` to access the event target element inside expressions
- Example: `@input="username = $el.value"`

---

## 📁 Project Structure

```
project/
├─ index.html
├─ node_modules/
│  └─ kanciljs/
│     └─ src/kancil.js
└─ main.js
```

---

## 📄 License

MIT © 2025 [Pino Ruswana](https://github.com/pinoruswana)

---

> “Kancil is not just clever – it's agile, minimal, and perfect for fast and modern development.”
