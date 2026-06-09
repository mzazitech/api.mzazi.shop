/* ============================================
   API DOCS — Main JavaScript
   ============================================ */

/* ── Page Loader ────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

/* ── Mobile Menu ────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
}

/* ── Toast Notifications ────────────────── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ── Copy to Clipboard ──────────────────── */
function copyText(text, label = 'Copied') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} to clipboard`, 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`${label} to clipboard`, 'success');
  });
}

/* ── Copy buttons (data-copy attribute) ─── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy]');
  if (btn) {
    const text = btn.getAttribute('data-copy');
    const label = btn.getAttribute('data-copy-label') || 'Copied';
    copyText(text, label);
  }
});

/* ── Endpoint accordion ─────────────────── */
document.addEventListener('click', (e) => {
  const header = e.target.closest('.endpoint-header');
  if (!header) return;
  // Don't toggle if clicking a button inside header
  if (e.target.closest('button') || e.target.closest('a')) return;
  const card = header.closest('.endpoint-card');
  const body = card.querySelector('.endpoint-body');
  const chevron = header.querySelector('.chevron');
  if (body) {
    body.classList.toggle('open');
    if (chevron) chevron.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
  }
});

/* ── Search Endpoints ───────────────────── */
const searchInput = document.getElementById('endpoint-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.endpoint-card');
    let visible = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    const noResult = document.getElementById('no-results');
    if (noResult) noResult.style.display = visible === 0 ? '' : 'none';
  });
}

/* ── Animated counters ──────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const decimals = el.getAttribute('data-decimals') || 0;
  const duration = 1800;
  const step = 16;
  const steps = duration / step;
  let current = 0;
  const increment = target / steps;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + current.toFixed(decimals) + suffix;
  }, step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = '1';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => observer.observe(el));
}
initCounters();

/* ── Status bar animation ───────────────── */
function initStatusBars() {
  const bars = document.querySelectorAll('.status-bar-fill[data-width]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const w = entry.target.getAttribute('data-width');
        setTimeout(() => { entry.target.style.width = w + '%'; }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => {
    b.style.width = '0%';
    observer.observe(b);
  });
}
initStatusBars();

/* ── Uptime chart builder ───────────────── */
function buildUptimeChart(containerId, uptime = 99.9) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const days = 90;
  for (let i = 0; i < days; i++) {
    const div = document.createElement('div');
    div.className = 'uptime-day';
    const rand = Math.random();
    if (rand > (1 - uptime / 100) * 3) {
      div.classList.add('up');
    } else if (rand > 0.02) {
      div.classList.add('degrad');
    } else {
      div.classList.add('down');
    }
    div.title = `Day ${days - i}: ${div.classList.contains('up') ? 'Operational' : div.classList.contains('degrad') ? 'Degraded' : 'Outage'}`;
    container.appendChild(div);
  }
}
buildUptimeChart('uptime-api', 99.9);
buildUptimeChart('uptime-cdn', 100);
buildUptimeChart('uptime-auth', 99.8);

/* ── Tab switcher ───────────────────────── */
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  const group = tab.closest('.tab-group');
  if (!group) return;
  const tabs = group.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const target = tab.getAttribute('data-tab');
  const panels = document.querySelectorAll(`[data-tab-panel="${group.id}"]`);
  panels.forEach(p => {
    p.style.display = p.getAttribute('data-panel') === target ? '' : 'none';
  });
});

/* ── Active nav link ────────────────────── */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && href === 'index.html') || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Reveal on scroll ───────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}
initReveal();

/* ── Sidebar active tracking ────────────── */
function initSidebarHighlight() {
  const sections = document.querySelectorAll('[id]');
  const links = document.querySelectorAll('.sidebar-link');
  if (!links.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.sidebar-link[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0% -60% 0%' });
  sections.forEach(s => obs.observe(s));
}
initSidebarHighlight();

/* ── API Key generator (mock) ───────────── */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'sk_live_';
  let key = prefix;
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}
const keyDisplay = document.getElementById('api-key-display');
if (keyDisplay) {
  const key = generateApiKey();
  keyDisplay.textContent = key;
  keyDisplay.closest('[data-copy-target]')?.setAttribute('data-copy', key);
}
const regenBtn = document.getElementById('regen-key');
if (regenBtn && keyDisplay) {
  regenBtn.addEventListener('click', () => {
    const newKey = generateApiKey();
    keyDisplay.textContent = newKey;
    const copyBtn = document.getElementById('copy-api-key');
    if (copyBtn) copyBtn.setAttribute('data-copy', newKey);
    showToast('New API key generated', 'success');
  });
}

/* ── Real-time fake latency ─────────────── */
function startLatencySimulation() {
  const latencyEls = document.querySelectorAll('.live-latency');
  if (!latencyEls.length) return;
  setInterval(() => {
    latencyEls.forEach(el => {
      const base = parseInt(el.getAttribute('data-base') || '42');
      const jitter = Math.floor(Math.random() * 20) - 10;
      el.textContent = Math.max(10, base + jitter) + 'ms';
    });
  }, 2000);
}
startLatencySimulation();
