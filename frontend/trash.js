// ============================================================
//  trash.js — Papelera (Full Stack)
// ============================================================

const API = '/api';

function getToken() { return localStorage.getItem('tm_token'); }

async function apiFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  return res;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function checkEmpty() {
  const list  = document.getElementById('trashList');
  const empty = document.getElementById('emptyTrash');
  empty.style.display = list.children.length === 0 ? 'block' : 'none';
}

function createTrashItem(task) {
  const li = document.createElement('li');
  li.className = 'trash-item';
  li.innerHTML = `
    <div>
      <p class="trash-item__title">${escapeHTML(task.title)}</p>
      <p class="trash-item__desc">${escapeHTML(task.description || '')}</p>
    </div>
    <div class="trash-actions">
      <button class="btn-icon btn-save"   title="Restaurar"           aria-label="Restaurar tarea">↩</button>
      <button class="btn-icon btn-delete" title="Eliminar para siempre" aria-label="Eliminar permanentemente">✕</button>
    </div>
  `;

  // Restaurar
  li.querySelector('.btn-save').addEventListener('click', async () => {
    const res = await apiFetch(`${API}/tasks/${task._id}/restore`, { method: 'PATCH' });
    if (!res.ok) return;
    li.style.opacity    = '0';
    li.style.transition = 'opacity 0.2s';
    setTimeout(() => { li.remove(); checkEmpty(); }, 200);
  });

  // Eliminar permanentemente
  li.querySelector('.btn-delete').addEventListener('click', async () => {
    const res = await apiFetch(`${API}/tasks/${task._id}`, { method: 'DELETE' });
    if (!res.ok) return;
    li.style.opacity    = '0';
    li.style.transition = 'opacity 0.2s';
    setTimeout(() => { li.remove(); checkEmpty(); }, 200);
  });

  return li;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) { window.location.href = 'index.html'; return; }

  const list = document.getElementById('trashList');
  const res  = await apiFetch(`${API}/tasks/trash`);
  if (res.status === 401) { window.location.href = 'index.html'; return; }

  const tasks = await res.json();
  tasks.forEach(t => list.appendChild(createTrashItem(t)));
  checkEmpty();

  // Restaurar todo
  document.getElementById('restoreAllBtn').addEventListener('click', async () => {
    const res = await apiFetch(`${API}/tasks/trash/restore-all`, { method: 'PATCH' });
    if (!res.ok) return;
    list.innerHTML = '';
    checkEmpty();
  });
});
