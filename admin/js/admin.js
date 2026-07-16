'use strict';

const API_BASE = '/api';
const TOKEN_KEY = 'jadwal_admin_token';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY); // sessionStorage: hilang saat tab ditutup, tidak persisten.
}
function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

async function apiFetch(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Permintaan gagal (${res.status})`);
  return data;
}

/* ============ HALAMAN LOGIN ============ */
function initLoginPage() {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const btn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'msg';
    btn.disabled = true;
    btn.textContent = 'Memproses…';

    try {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      window.location.href = 'dashboard.html';
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'msg error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}

/* ============ HALAMAN DASHBOARD ============ */
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function showDashError(message) {
  const el = document.getElementById('dashError');
  el.textContent = message;
  el.style.display = 'block';
}

async function loadWhoAmI() {
  const me = await apiFetch('/auth/me');
  document.getElementById('whoAmI').textContent = `Masuk sebagai: ${me.username}`;
}

async function loadScheduleEditor() {
  const data = await apiFetch('/schedule');
  const table = document.getElementById('editTable');

  let html = '<thead><tr><th>Jam</th>';
  DAYS.forEach((d) => { html += `<th>${escapeHtml(d)}</th>`; });
  html += '</tr></thead><tbody>';

  data.slots.forEach((s) => {
    html += `<tr><th>${escapeHtml(s.label)}<br><span style="color:#5c7089">${s.start_time.slice(0,5)}–${s.end_time.slice(0,5)}</span></th>`;
    DAYS.forEach((d) => {
      const val = data.schedule[d] ? data.schedule[d][s.slot_key] : '';
      html += `<td>
        <input type="text" maxlength="40" value="${escapeHtml(val || '')}" data-day="${d}" data-slot="${s.slot_key}">
      </td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Simpan otomatis saat kolom kehilangan fokus (blur) jika nilainya berubah.
  table.querySelectorAll('input').forEach((input) => {
    const original = input.value;
    input.addEventListener('blur', async () => {
      if (input.value === original) return;
      try {
        await apiFetch('/schedule', {
          method: 'PUT',
          body: JSON.stringify({
            day: input.dataset.day,
            slotKey: input.dataset.slot,
            subjectCode: input.value.trim() || null,
          }),
        });
        input.style.borderColor = 'var(--amber)';
      } catch (err) {
        showDashError(`Gagal menyimpan (${input.dataset.day}, ${input.dataset.slot}): ${err.message}`);
      }
    });
  });
}

function initDashboard() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearToken();
    window.location.href = 'login.html';
  });

  (async () => {
    try {
      await loadWhoAmI();
      await loadScheduleEditor();
    } catch (err) {
      if (err.message.includes('kedaluwarsa') || err.message.includes('Token')) {
        clearToken();
        window.location.href = 'login.html';
        return;
      }
      showDashError(err.message);
    }
  })();

  const pwForm = document.getElementById('pwForm');
  const pwMsg = document.getElementById('pwMsg');
  pwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    pwMsg.textContent = '';
    try {
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const data = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      pwMsg.textContent = data.message;
      pwForm.reset();
    } catch (err) {
      pwMsg.textContent = err.message;
    }
  });
}

/* ============ ROUTER SEDERHANA ============ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('loginForm')) initLoginPage();
  if (document.getElementById('editTable')) initDashboard();
});
