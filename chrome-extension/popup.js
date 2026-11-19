const API_BASE = 'http://localhost:3000/api';

let currentTab = null;
let currentSummary = null;

// ─── Initialize on popup load ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const badgeIcon  = document.getElementById('badge-icon');
  const badgeLabel = document.getElementById('badge-label');
  const tabTitle   = document.getElementById('tab-title');
  const tabUrl     = document.getElementById('tab-url');
  const themeBtn   = document.getElementById('theme-toggle-btn');
  const summarizeBtn = document.getElementById('summarize-btn');

  // 1. Apply saved theme
  await initTheme();

  // 2. Theme toggle listener
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  try {
    // 3. Get active tab from Chrome
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0]) {
        currentTab = tabs[0];
      }
    }

    // Fallback for direct HTML testing in browser
    if (!currentTab) {
      currentTab = {
        title: 'Artificial Intelligence – Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
      };
    }

    // 4. Populate tab info card
    tabTitle.textContent = currentTab.title || 'Untitled Page';
    tabUrl.textContent   = currentTab.url   || '';

    // 5. Detect YouTube vs website
    const isYouTube = currentTab.url &&
      (currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be'));

    if (isYouTube) {
      if (badgeIcon)  badgeIcon.textContent  = '📺';
      if (badgeLabel) badgeLabel.textContent = 'YouTube Video Detected';
      document.getElementById('tab-badge')?.classList.add('youtube');
    } else {
      if (badgeIcon)  badgeIcon.textContent  = '📄';
      if (badgeLabel) badgeLabel.textContent = 'Website Article Detected';
      document.getElementById('tab-badge')?.classList.remove('youtube');
    }

    // 6. Check backend connection & update status pill
    checkBackendStatus();

    // 7. Attach action listeners
    summarizeBtn.addEventListener('click', handleSummarize);
    document.getElementById('copy-btn').addEventListener('click', handleCopy);

  } catch (err) {
    console.error(err);
    showError('Failed to load active tab: ' + err.message);
  }
});

// ─── Backend Status Check ──────────────────────────────────────────────────────
async function checkBackendStatus() {
  const pill = document.getElementById('status-pill');
  const text = document.getElementById('status-text');
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      if (pill) pill.style.boxShadow = '0 0 16px rgba(52, 211, 153, 0.25)';
      if (text) text.textContent = 'Connected';
    } else {
      setDisconnected(pill, text);
    }
  } catch {
    setDisconnected(pill, text);
  }
}

function setDisconnected(pill, text) {
  if (pill) {
    pill.style.background = 'rgba(239, 68, 68, 0.12)';
    pill.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    pill.style.color = '#ef4444';
    pill.style.boxShadow = 'none';
    const dot = pill.querySelector('.status-dot');
    if (dot) dot.style.background = '#ef4444';
  }
  if (text) text.textContent = 'Offline';
}

// ─── Theme Management ──────────────────────────────────────────────────────────
async function initTheme() {
  let theme = 'light'; // default: light
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(['brieflyai_theme']);
      if (res && res.brieflyai_theme) theme = res.brieflyai_theme;
    } else {
      theme = localStorage.getItem('brieflyai_theme') || 'light';
    }
  } catch {
    theme = 'light';
  }
  applyTheme(theme);
}

function applyTheme(theme) {
  const body     = document.body;
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon  = document.getElementById('sun-icon');

  if (theme === 'dark') {
    body.classList.remove('light');
    body.classList.add('dark');
    // In dark mode: show sun icon (click to go light)
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon)  sunIcon.classList.remove('hidden');
  } else {
    body.classList.remove('dark');
    body.classList.add('light');
    // In light mode: show moon icon (click to go dark)
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (sunIcon)  sunIcon.classList.add('hidden');
  }
}

async function toggleTheme() {
  const isDark   = document.body.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ brieflyai_theme: newTheme });
    } else {
      localStorage.setItem('brieflyai_theme', newTheme);
    }
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

// ─── Auth Token ────────────────────────────────────────────────────────────────
async function getAuthToken() {
  // Try stored token first
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['brieflyai_token']);
    if (data.brieflyai_token) return data.brieflyai_token;
  }

  // Auto-login with demo account
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@brieflyai.com', password: 'DemoPass123!' })
    });
    const data = await res.json();
    if (data && data.accessToken) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ brieflyai_token: data.accessToken });
      }
      return data.accessToken;
    }
  } catch (e) {
    console.warn('Auto demo login failed:', e);
  }
  return null;
}

// ─── Summarize Handler ─────────────────────────────────────────────────────────
async function handleSummarize() {
  if (!currentTab || !currentTab.url) {
    showError('No active tab URL detected.');
    return;
  }

  const model   = document.getElementById('model-select').value;
  const tone    = document.getElementById('tone-select').value;
  const btn     = document.getElementById('summarize-btn');
  const btnText = document.getElementById('btn-text');
  const loading = document.getElementById('loading-state');
  const resultContainer = document.getElementById('result-container');

  hideError();
  resultContainer.classList.add('hidden');
  loading.classList.remove('hidden');
  btn.disabled = true;
  if (btnText) btnText.textContent = 'Summarizing...';

  // Animate loading steps
  const steps = [
    'Parsing content structure & arguments...',
    'Extracting key insights...',
    'Generating executive overview...',
    'Composing 5 key takeaway points...',
    'Finalizing your summary...'
  ];
  let stepIdx = 0;
  const stepEl = document.getElementById('loading-step');
  const stepTimer = setInterval(() => {
    if (stepEl && stepIdx < steps.length) {
      stepEl.textContent = steps[stepIdx++];
    }
  }, 1800);

  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Cannot connect to BrieflyAI backend (localhost:3000). Make sure the server is running.');
    }

    const isYouTube = currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be');
    const endpoint  = isYouTube ? `${API_BASE}/summarize/youtube` : `${API_BASE}/summarize/url`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: currentTab.url,
        modelPreference: model,
        summaryLength: 'standard',
        tone: tone
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Summarization request failed.');
    }

    currentSummary = data.summary;
    renderSummary(currentSummary);

  } catch (err) {
    showError(err.message || 'An error occurred during summarization.');
  } finally {
    clearInterval(stepTimer);
    loading.classList.add('hidden');
    btn.disabled = false;
    if (btnText) btnText.textContent = 'Summarize Active Tab';
  }
}

// ─── Render Summary Results ────────────────────────────────────────────────────
function renderSummary(summary) {
  const resultContainer = document.getElementById('result-container');
  const titleEl         = document.getElementById('result-title');
  const categoryEl      = document.getElementById('result-category');
  const timeEl          = document.getElementById('result-time');
  const overviewEl      = document.getElementById('result-overview');
  const keypointsList   = document.getElementById('keypoints-list');

  if (titleEl)    titleEl.textContent    = summary.title || 'Summary';
  if (categoryEl) categoryEl.textContent = summary.category || 'General';
  if (timeEl)     timeEl.textContent     = `~${summary.readingTimeMinutes || 3} min read (${summary.wordCount || 0} words)`;
  if (overviewEl) overviewEl.textContent = summary.overview || '';

  // Render key points with new CSS class names (.keypoint-row / .keypoint-badge)
  if (keypointsList) {
    keypointsList.innerHTML = '';
    if (summary.keyPoints && summary.keyPoints.length) {
      summary.keyPoints.forEach((point, idx) => {
        const item = document.createElement('div');
        item.className = 'keypoint-row';
        item.innerHTML = `
          <span class="keypoint-badge">${idx + 1}</span>
          <span>${escapeHtml(point)}</span>
        `;
        keypointsList.appendChild(item);
      });
    }
  }

  resultContainer.classList.remove('hidden');
  // Smooth scroll to results
  setTimeout(() => resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

// ─── Copy to Clipboard ─────────────────────────────────────────────────────────
function handleCopy() {
  if (!currentSummary) return;

  const keyPointsText = currentSummary.keyPoints
    ? currentSummary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')
    : '';

  const text = `# ${currentSummary.title}

## Overview
${currentSummary.overview}

## 5 Key Takeaway Points
${keyPointsText}

---
Summarized with BrieflyAI Hub • brieflyai.com`;

  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      const span = copyBtn.querySelector('span:last-child');
      if (span) {
        span.textContent = 'Copied!';
        setTimeout(() => { span.textContent = 'Copy'; }, 2200);
      }
    }
  }).catch(err => console.warn('Clipboard write failed:', err));
}

// ─── Error Helpers ─────────────────────────────────────────────────────────────
function showError(msg) {
  const box = document.getElementById('error-box');
  if (box) {
    box.textContent = '⚠️ ' + msg;
    box.classList.remove('hidden');
  }
}

function hideError() {
  const box = document.getElementById('error-box');
  if (box) box.classList.add('hidden');
}

// ─── Utility ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
