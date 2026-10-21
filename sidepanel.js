document.addEventListener('DOMContentLoaded', () => {
  // Initialize Tab Switcher
  setupTabNavigation();

  // Initialize Tool Actions
  setupAutomationTab();
  setupSelectorsTab();
  setupSecurityTab();
  setupUITab();

  logConsole('DevDesk Pro Side Panel Ready.', 'info');
});

// --- NAVIGATION CONTROLLER ---
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// --- UTILITY: TAB COMMUNICATION ---
async function sendTabMessage(action, payload = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    logConsole('Error: No active tab identified.', 'error');
    return null;
  }

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { action, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        logConsole(`Execution Error: ${chrome.runtime.lastError.message}`, 'error');
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

function logConsole(message, type = 'info') {
  const consoleBody = document.getElementById('console-output');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  entry.innerText = `[${timestamp}] ${message}`;
  consoleBody.appendChild(entry);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

document.getElementById('btn-clear-console').addEventListener('click', () => {
  document.getElementById('console-output').innerHTML = '';
});

// --- MODULE 1: AUTOMATION & SERVICE DESK ---
function setupAutomationTab() {
  document.getElementById('btn-record-macro').addEventListener('click', async () => {
    logConsole('Initiating Macro Recording...', 'warn');
    await sendTabMessage('START_RECORDING');
    updateStatus('Recording Macro...', 'active');
  });

  document.getElementById('btn-stop-macro').addEventListener('click', async () => {
    const res = await sendTabMessage('STOP_RECORDING');
    if (res && res.steps) {
      logConsole(`Macro saved with ${res.steps.length} steps.`, 'success');
    }
    updateStatus('Ready', 'idle');
  });

  document.getElementById('btn-run-macro').addEventListener('click', async () => {
    logConsole('Executing Recorded Sequence...', 'info');
    await sendTabMessage('PLAY_MACRO');
    updateStatus('Running Loop...', 'active');
  });

  document.getElementById('btn-clear-macro').addEventListener('click', async () => {
    await sendTabMessage('CLEAR_MACRO');
    logConsole('Cleared macro steps.', 'info');
  });

  document.getElementById('btn-lock-table').addEventListener('click', async () => {
    logConsole('Table Picker activated. Hover over target table in page.', 'info');
    await sendTabMessage('PICK_TABLE');
  });

  document.getElementById('btn-lock-next').addEventListener('click', async () => {
    logConsole('Button Picker activated. Hover over Next Page button.', 'info');
    await sendTabMessage('PICK_NEXT_BTN');
  });

  document.getElementById('btn-execute-scrape').addEventListener('click', async () => {
    const delay = parseFloat(document.getElementById('scrape-delay').value) || 2.0;
    const audit = document.getElementById('chk-agent-audit').checked;
    logConsole(`Starting Scraper (Delay: ${delay}s, Audit: ${audit})...`, 'info');
    await sendTabMessage('START_SCRAPE', { delay, audit });
  });

  document.getElementById('btn-run-unlocker').addEventListener('click', async () => {
    logConsole('Executing Telviva Account Unlock Loop...', 'warn');
    await sendTabMessage('START_UNLOCK_LOOP');
  });
}

// --- MODULE 2: SELECTOR & BLUEPRINT ENGINE ---
function setupSelectorsTab() {
  document.getElementById('btn-inspect-element').addEventListener('click', async () => {
    logConsole('Click an element on page to generate selectors...', 'info');
    const res = await sendTabMessage('INSPECT_ELEMENT');
    if (res && res.primary) {
      document.getElementById('out-primary-selector').value = res.primary;
      document.getElementById('out-fallback-selectors').value = res.fallbacks.join('\n');
      logConsole('Successfully generated primary and fallback selectors.', 'success');
    }
  });

  document.getElementById('btn-generate-blueprint').addEventListener('click', async () => {
    logConsole('Generating BeautifulSoup4 parsing blueprint...', 'info');
    const res = await sendTabMessage('GENERATE_BLUEPRINT');
    if (res && res.code) {
      document.getElementById('out-blueprint-code').value = res.code;
      logConsole('Python Blueprint ready.', 'success');
    }
  });
}

// --- MODULE 3: SECURITY & ACCESSIBILITY AUDITOR ---
function setupSecurityTab() {
  document.getElementById('btn-audit-xss').addEventListener('click', async () => {
    logConsole('Scanning DOM for dangerous inline scripts & XSS vectors...', 'warn');
    const res = await sendTabMessage('AUDIT_XSS');
    if (res) {
      document.getElementById('out-xss-results').value = res.report;
      logConsole(`XSS Audit Complete. Found ${res.vectorCount} potential points.`, res.vectorCount > 0 ? 'warn' : 'success');
    }
  });

  document.getElementById('btn-audit-a11y').addEventListener('click', async () => {
    logConsole('Running WCAG 2.1 Accessibility Audit...', 'info');
    const res = await sendTabMessage('AUDIT_A11Y');
    if (res) {
      document.getElementById('a11y-score').innerText = `${res.score}%`;
      document.getElementById('a11y-errors').innerText = res.errors.length;
      document.getElementById('out-a11y-issues').value = res.errors.join('\n');
      logConsole(`Accessibility Audit complete. Score: ${res.score}%`, 'success');
    }
  });
}

// --- MODULE 4: UI & PERFORMANCE SYNTHESIZER ---
function setupUITab() {
  document.getElementById('btn-transpile-ui').addEventListener('click', async () => {
    logConsole('Transpiling selected DOM element to React + Tailwind...', 'info');
    const res = await sendTabMessage('TRANSPILE_REACT');
    if (res && res.jsx) {
      document.getElementById('out-react-code').value = res.jsx;
      logConsole('React Component generated.', 'success');
    }
  });

  document.getElementById('btn-transpile-email').addEventListener('click', async () => {
    logConsole('Converting element to legacy table-based HTML...', 'info');
    const res = await sendTabMessage('TRANSPILE_EMAIL');
    if (res && res.html) {
      document.getElementById('out-email-code').value = res.html;
      logConsole('Email HTML generated.', 'success');
    }
  });

  document.getElementById('btn-analyze-dom').addEventListener('click', async () => {
    logConsole('Measuring DOM depth and total node counts...', 'info');
    const res = await sendTabMessage('ANALYZE_DOM');
    if (res) {
      document.getElementById('dom-depth').innerText = res.maxDepth;
      document.getElementById('dom-count').innerText = res.totalNodes;
      logConsole(`DOM Analysis complete. Max Depth: ${res.maxDepth}, Total Nodes: ${res.totalNodes}`, 'info');
    }
  });
}

function updateStatus(text, stateClass) {
  document.getElementById('global-status-text').innerText = text;
  const dot = document.getElementById('global-status-dot');
  dot.className = `status-dot ${stateClass}`;
}