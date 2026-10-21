// ============================================================================
// DEVDESK PRO: UNIFIED CONTENT ENGINE
// ============================================================================

let isRecording = false;
let recordedSteps = [];
let selectedTable = null;
let selectedNextBtn = null;

// --- UTILITY: SMART SELECTOR GENERATOR ---
function generateSmartSelector(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
  if (el.id && !el.id.match(/^[0-9]/) && el.id.length < 30) return `#${el.id}`;

  const attrTest = ['data-testid', 'data-cy', 'aria-label', 'name'];
  for (const attr of attrTest) {
    if (el.hasAttribute(attr)) return `${el.tagName.toLowerCase()}[${attr}="${el.getAttribute(attr)}"]`;
  }

  let path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE && el.tagName.toLowerCase() !== 'html') {
    let tag = el.tagName.toLowerCase();
    let siblingIndex = 1;
    let sibling = el.previousElementSibling;

    while (sibling) {
      if (sibling.tagName.toLowerCase() === tag) siblingIndex++;
      sibling = sibling.previousElementSibling;
    }

    path.unshift(siblingIndex > 1 ? `${tag}:nth-of-type(${siblingIndex})` : tag);
    el = el.parentElement;
  }
  return path.join(' > ');
}

// --- RECORDING ENGINE ---
document.addEventListener('click', (e) => {
  if (!isRecording) return;
  const target = e.target;
  const selector = generateSmartSelector(target);
  
  recordedSteps.push({
    action: 'click',
    target: selector,
    text: target.innerText?.trim() || '',
    tagName: target.tagName
  });
}, true);

// --- MESSAGE ROUTER & MODULE IMPLEMENTATIONS ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action } = request;

  // 1. AUTOMATION MODULES
  if (action === 'START_RECORDING') {
    isRecording = true;
    recordedSteps = [];
    sendResponse({ status: 'recording_started' });
  }

  if (action === 'STOP_RECORDING') {
    isRecording = false;
    sendResponse({ steps: recordedSteps });
  }

  if (action === 'PLAY_MACRO') {
    executeMacroSteps(recordedSteps);
    sendResponse({ status: 'execution_started' });
  }

  if (action === 'CLEAR_MACRO') {
    recordedSteps = [];
    sendResponse({ status: 'cleared' });
  }

  // 2. SELECTOR & BLUEPRINT MODULES
  if (action === 'INSPECT_ELEMENT') {
    activateInspector((element) => {
      const primary = generateSmartSelector(element);
      const fallbacks = [
        `//${element.tagName.toLowerCase()}[contains(text(), '${element.innerText?.trim().substring(0, 15)}')]`,
        element.className ? `.${element.className.trim().replace(/\s+/g, '.')}` : ''
      ].filter(Boolean);

      sendResponse({ primary, fallbacks });
    });
    return true; // Async response
  }

  if (action === 'GENERATE_BLUEPRINT') {
    const table = document.querySelector('table');
    if (!table) {
      sendResponse({ code: '# No table found on current page.' });
    } else {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
      const pyCode = `from bs4 import BeautifulSoup\n\nsoup = BeautifulSoup(html_doc, 'html.parser')\ntable = soup.find('table')\nheaders = ${JSON.stringify(headers)}\nfor row in table.find_all('tr'):\n    cols = [td.get_text(strip=True) for td in row.find_all('td')]\n    print(dict(zip(headers, cols)))`;
      sendResponse({ code: pyCode });
    }
  }

  // 3. SECURITY & ACCESSIBILITY AUDITORS
  if (action === 'AUDIT_XSS') {
    const scripts = document.querySelectorAll('script, [onclick], [onerror], [onload]');
    let findings = [];
    scripts.forEach(el => {
      if (el.hasAttribute('onclick')) findings.push(`Inline Event: ${el.getAttribute('onclick')}`);
      if (el.hasAttribute('onerror')) findings.push(`Dangerous Handler: ${el.getAttribute('onerror')}`);
      if (el.tagName === 'SCRIPT' && !el.src && el.innerText.includes('eval(')) findings.push('Dynamic Eval Detected in Script block.');
    });

    const report = findings.length > 0 
      ? findings.join('\n') 
      : 'No common inline XSS vectors identified in the current DOM tree.';
    sendResponse({ report, vectorCount: findings.length });
  }

  if (action === 'AUDIT_A11Y') {
    let errors = [];
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) errors.push(`[WCAG 1.1.1] ${images.length} image(s) missing alt attributes.`);

    const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
    if (inputs.length > 0) errors.push(`[WCAG 1.3.1] ${inputs.length} input(s) lack associated labels or aria-labels.`);

    const score = Math.max(0, 100 - (errors.length * 15));
    sendResponse({ score, errors });
  }

  // 4. UI & PERFORMANCE SYNTHESIZERS
  if (action === 'TRANSPILE_REACT') {
    const main = document.querySelector('main, article, div') || document.body;
    const jsx = `<div className="${main.className}">\n  {/* Transpiled DOM subtree */}\n  <h1>${document.title}</h1>\n</div>`;
    sendResponse({ jsx });
  }

  if (action === 'TRANSPILE_EMAIL') {
    const emailHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0">\n  <tr>\n    <td align="center" style="padding: 20px;">\n      <!--[if mso]><table width="600"><tr><td><![endif]-->\n      ${document.body.innerHTML.substring(0, 200)}...\n      <!--[if mso]></td></tr></table><![endif]-->\n    </td>\n  </tr>\n</table>`;
    sendResponse({ html: emailHtml });
  }

  if (action === 'ANALYZE_DOM') {
    let maxDepth = 0;
    const totalNodes = document.getElementsByTagName('*').length;

    function getDepth(node, depth = 1) {
      if (depth > maxDepth) maxDepth = depth;
      for (let child of node.children) {
        getDepth(child, depth + 1);
      }
    }
    getDepth(document.body);

    sendResponse({ maxDepth, totalNodes });
  }
});

// Helper for element inspector
function activateInspector(callback) {
  const handler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener('click', handler, true);
    document.querySelectorAll('.devdesk-highlight').forEach(el => el.classList.remove('devdesk-highlight'));
    callback(e.target);
  };

  document.addEventListener('click', handler, true);
}

// Macro Runner
async function executeMacroSteps(steps) {
  for (const step of steps) {
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      el.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}