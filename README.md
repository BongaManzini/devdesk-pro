# DevDesk Pro – Service Desk Automation Chrome Extension

**DevDesk Pro** is a Manifest V3 Chrome Extension built for service desk agents and web developers. It lives in Chrome's native Side Panel and bundles four powerful toolsets into a single HUD: a macro-based ticket automation engine, a QueueMetrics table scraper, a Telviva account unlocker, and a suite of DOM, security, and UI utilities.

---

## Features

### Workflow Automation Engine
- **Macro Recorder** – Record click sequences on any page and replay them as automated loops across ticketing tables
- **Auto Ticket Closer** – Execute multi-step ticket-closing sequences without manual interaction
- **Smart Selector Generation** – Automatically generates stable CSS selectors (`id`, `data-testid`, `aria-label`, nth-of-type path) for recorded elements

### QueueMetrics & Table Scraper
- **Multi-page DOM scraping** with configurable paging intervals
- Lock any on-page `<table>` and "Next" button as DOM anchors for automated pagination
- Optional **Agent Audit** mode (flags rows where Agent name matches password field)
- Outputs a ready-to-use **Python / BeautifulSoup4 parser blueprint** from the live table structure

### Telviva Account Unlocker
- Runs a continuous **unlock loop** to clear locked Telviva agent accounts without navigating away from your current workflow

### DOM & Selector Tools
- **Element Inspector** – Click any element to instantly generate its primary CSS selector plus XPath/class fallbacks
- **Scraping Blueprint Generator** – Produces Python BS4 boilerplate from the first `<table>` found on the active page

### ️ Security Auditor
- **XSS Surface Analyzer** – Scans the live DOM for inline event handlers (`onclick`, `onerror`, `onload`) and `eval()` calls
- **Accessibility (a11y) Inspector** – Checks WCAG 2.1 AA compliance: missing `alt` attributes, unlabeled inputs, and ARIA coverage; produces a 0–100 score

### UI / UX Synthesizers
- **HTML → React/Tailwind Transpiler** – Converts a selected DOM node into a JSX component scaffold
- **Email HTML Transpiler** – Wraps modern layouts in Outlook-compatible nested-table HTML
- **DOM Performance Analyzer** – Reports maximum nesting depth and total node count to identify render bottlenecks

### Side Panel HUD
- Persistent Chrome Side Panel UI — stays open while you navigate between tabs
- Tabbed navigation (Auto · DOM · Security · UI/UX)
- Live **Execution Log** console drawer with status indicators

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension Platform | Chrome Extensions **Manifest V3** |
| Background Runtime | Service Worker (`background.js`) |
| UI | Vanilla HTML5, CSS3 (`styles.css`) |
| Logic | Vanilla JavaScript (ES2020+) |
| Storage | `chrome.storage.local` |
| APIs Used | `sidePanel`, `scripting`, `activeTab`, `tabs`, `storage` |

---

## Installation

> **No build step required.** This extension is loaded directly as unpacked source.

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/your-username/devdesk-pro.git
   ```

2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions
   ```

3. Enable **Developer mode** (toggle in the top-right corner).

4. Click **"Load unpacked"** and select the `Service Desk Pro/` folder (the directory containing `manifest.json`).

5. The **DevDesk Pro** extension will appear in your toolbar. Pin it for quick access.

---

## Usage

### Opening the Panel
Click the **DevDesk Pro** toolbar icon — the Chrome Side Panel will open automatically.

### Automation Tab (` Auto`)
| Action | How |
|---|---|
| Record a macro | Click **️ Record Macro**, perform clicks on the page, click **️ Stop** |
| Replay the macro | Click **▶️ Run Sequence** |
| Scrape a table | Click ** Lock Table** on a page with a `<table>`, set your paging interval, click ** Start Multi-Page Scrape** |
| Unlock Telviva accounts | Navigate to the Telviva admin page, click ** Run Account Unlocker Loop** |

### DOM Tab (` DOM`)
1. Click ** Inspect Target Element**, then click any element on the page.
2. The primary CSS selector and XPath/class fallbacks appear in the output fields.
3. Click ** Generate Python Parser** on any page with a table to get a ready-to-run BS4 script.

### Security Tab (`️ Security`)
- **️ Audit Page XSS Vectors** – scans the current page and lists risky inline handlers.
- ** Run Accessibility Scan** – returns a WCAG compliance score and a list of failures.

### UI/UX Tab (` UI/UX`)
- **️ Transpile Selected Component** – outputs a JSX scaffold of the page's main container.
- **️ Transpile to Email HTML** – generates Outlook-safe table-based HTML.
- ** Analyze DOM Performance** – displays max nesting depth and total node count.

---

## Project Structure

```
Service Desk Pro/
├── manifest.json   # Extension manifest (MV3)
├── background.js   # Service worker: side panel init & macro storage
├── content.js     # Content script: recording engine, DOM modules
├── sidepanel.html   # Side Panel UI shell
├── sidepanel.js    # Side Panel controller logic
└── styles.css     # UI styles
```

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
