const API_BASE = 'http://localhost:3000/api';

let currentTab = null;
let currentSummary = null;

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  const tabBadge = document.getElementById('tab-badge');
  const tabTitle = document.getElementById('tab-title');
  const tabUrl = document.getElementById('tab-url');
  const summarizeBtn = document.getElementById('summarize-btn');
  const themeBtn = document.getElementById('theme-toggle-btn');

  // Initialize theme
  await initTheme();

  // Attach theme listener
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  try {
    // 1. Get active tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0]) {
        currentTab = tabs[0];
      }
    }

    // Fallback for direct browser testing
    if (!currentTab) {
      currentTab = {
        title: 'Artificial Intelligence - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
      };
    }

    tabTitle.textContent = currentTab.title || 'Untitled Page';
    tabUrl.textContent = currentTab.url || '';

    // Check if YouTube
    const isYouTube = currentTab.url && (currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be'));
    if (isYouTube) {
      tabBadge.textContent = 'YouTube Video Detected';
      tabBadge.classList.add('youtube');
    } else {
      tabBadge.textContent = 'Website Article Detected';
      tabBadge.classList.remove('youtube');
    }

    // Attach listeners
    summarizeBtn.addEventListener('click', handleSummarize);
    document.getElementById('copy-btn').addEventListener('click', handleCopy);

  } catch (err) {
    console.error(err);
    showError('Failed to initialize active tab: ' + err.message);
  }
});

// Theme Management
async function initTheme() {
  let theme = 'dark';
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(['brieflyai_theme']);
      if (res && res.brieflyai_theme) {
        theme = res.brieflyai_theme;
      }
    } else {
      theme = localStorage.getItem('brieflyai_theme') || 'dark';
    }
  } catch (e) {
    theme = 'dark';
  }

  applyTheme(theme);
}

function applyTheme(theme) {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');

  if (theme === 'light') {
    body.classList.remove('dark');
    body.classList.add('light');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    if (themeIcon) themeIcon.textContent = '☀️';
  }
}

async function toggleTheme() {
  const isLight = document.body.classList.contains('light');
  const newTheme = isLight ? 'dark' : 'light';
  applyTheme(newTheme);

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ brieflyai_theme: newTheme });
    } else {
      localStorage.setItem('brieflyai_theme', newTheme);
    }
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

async function getAuthToken() {
  let token = null;
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['brieflyai_token']);
    token = data.brieflyai_token;
  }

  if (!token) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@brieflyai.com',
          password: 'DemoPass123!'
        })
      });
      const data = await res.json();
      if (data && data.accessToken) {
        token = data.accessToken;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ brieflyai_token: token });
        }
      }
    } catch (e) {
      console.warn('Auto demo login failed:', e);
    }
  }

  return token;
}

async function handleSummarize() {
  if (!currentTab || !currentTab.url) {
    showError('No active tab URL detected.');
    return;
  }

  const model = document.getElementById('model-select').value;
  const tone = document.getElementById('tone-select').value;
  const btn = document.getElementById('summarize-btn');
  const loading = document.getElementById('loading-state');
  const resultContainer = document.getElementById('result-container');

  hideError();
  resultContainer.classList.add('hidden');
  loading.classList.remove('hidden');
  btn.disabled = true;

  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Could not connect to BrieflyAI backend on http://localhost:3000. Please ensure the backend is running.');
    }

    const isYouTube = currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be');
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Summarization request failed.');
    }

    currentSummary = data.summary;
    renderSummary(currentSummary);

  } catch (err) {
    showError(err.message || 'An error occurred during summarization.');
  } finally {
    loading.classList.add('hidden');
    btn.disabled = false;
  }
}

function renderSummary(summary) {
  const resultContainer = document.getElementById('result-container');
  const titleEl = document.getElementById('result-title');
  const categoryEl = document.getElementById('result-category');
  const timeEl = document.getElementById('result-time');
  const overviewEl = document.getElementById('result-overview');
  const keypointsList = document.getElementById('keypoints-list');

  titleEl.textContent = summary.title;
  categoryEl.textContent = summary.category || 'General';
  timeEl.textContent = `~${summary.readingTimeMinutes || 3} min read (${summary.wordCount || 0} words)`;
  overviewEl.textContent = summary.overview;

  keypointsList.innerHTML = '';
  if (summary.keyPoints && summary.keyPoints.length) {
    summary.keyPoints.forEach((point, idx) => {
      const item = document.createElement('div');
      item.className = 'keypoint-item';
      item.innerHTML = `
        <span class="keypoint-num">${idx + 1}</span>
        <span>${escapeHtml(point)}</span>
      `;
      keypointsList.appendChild(item);
    });
  }

  resultContainer.classList.remove('hidden');
  resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function handleCopy() {
  if (!currentSummary) return;

  const text = `# ${currentSummary.title}

## Overview
${currentSummary.overview}

## 5 Key Points
${currentSummary.keyPoints ? currentSummary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') : ''}

---
Summarized with BrieflyAI Hub`;

  navigator.clipboard.writeText(text);
  const copyBtn = document.getElementById('copy-btn');
  copyBtn.textContent = '✓ Copied!';
  setTimeout(() => {
    copyBtn.textContent = '📋 Copy';
  }, 2000);
}

function showError(msg) {
  const box = document.getElementById('error-box');
  box.textContent = msg;
  box.classList.remove('hidden');
}

function hideError() {
  const box = document.getElementById('error-box');
  box.classList.add('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
