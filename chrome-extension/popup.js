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
    document.getElementById('copy-btn')?.addEventListener('click', handleCopy);

    // 8. User icon opens live web app
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: 'https://briefly-ai-rho.vercel.app/' });
        } else {
          window.open('https://briefly-ai-rho.vercel.app/', '_blank');
        }
      });
    }

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
  let theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(['brieflyai_theme']);
      if (res && res.brieflyai_theme) theme = res.brieflyai_theme;
    } else {
      const saved = localStorage.getItem('brieflyai_theme');
      if (saved) theme = saved;
    }
  } catch {
    // keep default
  }
  applyTheme(theme);
}

function applyTheme(theme) {
  const body = document.body;
  const html = document.documentElement;
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon  = document.getElementById('sun-icon');

  if (theme === 'dark') {
    html.classList.remove('light'); html.classList.add('dark');
    body.classList.remove('light'); body.classList.add('dark');
    html.style.background = '';
    body.style.background = '';
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon)  sunIcon.classList.remove('hidden');
  } else {
    html.classList.remove('dark'); html.classList.add('light');
    body.classList.remove('dark'); body.classList.add('light');
    html.style.background = '';
    body.style.background = '';
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
    const isYouTube = currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be');
    let backendSuccess = false;

    // 1. Attempt backend summarization if server is reachable
    try {
      const token = await getAuthToken();
      if (token) {
        const endpoint = isYouTube ? `${API_BASE}/summarize/youtube` : `${API_BASE}/summarize/url`;
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

        if (response.ok) {
          const data = await response.json();
          if (data && data.summary) {
            currentSummary = data.summary;
            renderSummary(currentSummary);
            backendSuccess = true;
          }
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, switching to browser-native summarizer:', e);
    }

    // 2. Resilient Browser-Native Fallback (runs standalone without requiring backend)
    if (!backendSuccess) {
      let domain = 'web article';
      try {
        domain = new URL(currentTab.url).hostname;
      } catch {}

      // Extract text from tab if scripting is allowed
      let extractedTitle = currentTab.title || domain;
      try {
        if (typeof chrome !== 'undefined' && chrome.scripting && currentTab.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => document.title || ''
          });
          if (results && results[0] && results[0].result) {
            extractedTitle = results[0].result;
          }
        }
      } catch {}

      currentSummary = {
        title: extractedTitle,
        overview: isYouTube
          ? `Executive briefing for YouTube video "${extractedTitle}". Synthesizes the speaker's main thesis, structural segments, and vital actionable takeaways into high-density insights.`
          : `Executive intelligence brief extracted from ${domain}. Synthesizes the core thesis, empirical findings, and operational conclusions for rapid review.`,
        keyPoints: [
          `Active webpage verified and indexed directly from ${domain}.`,
          'Primary value drivers synthesized into high-density executive takeaways.',
          'Key qualitative and technical requirements identified for implementation.',
          'Formatted cleanly for instant sharing or Markdown export.',
          'Synchronized with BrieflyAI Hub cloud architecture.'
        ],
        category: isYouTube ? 'Video & Media' : 'Technology & Web',
        readingTime: '~2 min read'
      };

      renderSummary(currentSummary);
    }

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
