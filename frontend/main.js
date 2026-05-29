// ============================================================
//  main.js — Task Manager Full Stack
// ============================================================

const API = '/api';

// ── Auth helpers ─────────────────────────────────────────
function getToken() { return localStorage.getItem('tm_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('tm_user') || 'null'); }

function saveSession(token, user) {
  localStorage.setItem('tm_token', token);
  localStorage.setItem('tm_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('tm_token');
  localStorage.removeItem('tm_user');
}

// ── Fetch con auth ───────────────────────────────────────
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

// ── UI helpers ───────────────────────────────────────────
function showTab(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',    tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
}

function showApp(user) {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display  = 'block';
  document.getElementById('usernameDisplay').textContent = user.username;
  loadTasks();
}

function showAuth() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display  = 'none';
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Auth ─────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl  = document.getElementById('loginError');
  errorEl.textContent = '';

  const res  = await apiFetch(`${API}/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();

  if (!res.ok) { errorEl.textContent = data.error; return; }

  saveSession(data.token, data.user);
  showApp(data.user);
}

async function register() {
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errorEl  = document.getElementById('registerError');
  errorEl.textContent = '';

  const res  = await apiFetch(`${API}/auth/register`, { method: 'POST', body: JSON.stringify({ username, email, password }) });
  const data = await res.json();

  if (!res.ok) { errorEl.textContent = data.error; return; }

  saveSession(data.token, data.user);
  showApp(data.user);
}

function logout() {
  clearSession();
  showAuth();
}

// ── Tareas ───────────────────────────────────────────────
async function loadTasks() {
  const res   = await apiFetch(`${API}/tasks`);
  if (res.status === 401) { logout(); return; }
  const tasks = await res.json();
  const list  = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach(t => list.appendChild(createTaskElement(t)));
  updateCounter();
  checkEmptyState();
}

function updateCounter() {
  const counter = document.getElementById('taskCounter');
  if (!counter) return;
  const items   = document.querySelectorAll('#taskList .task-item:not(.completed)');
  const pending = items.length;
  counter.textContent = pending === 0
    ? 'Sin tareas pendientes'
    : `${pending} tarea${pending !== 1 ? 's' : ''} pendiente${pending !== 1 ? 's' : ''}`;
}

function checkEmptyState() {
  const list  = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  if (!list || !empty) return;
  empty.style.display = list.children.length === 0 ? 'block' : 'none';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task._id;

  li.innerHTML = `
    <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}" tabindex="0" aria-label="Marcar como completada">
      <span class="task-checkbox__check">✓</span>
    </div>
    <div class="task-content">
      <p class="task-title">${escapeHTML(task.title)}</p>
      <p class="task-desc">${escapeHTML(task.description || '')}</p>
      <input type="text" class="task-edit-input task-edit-title" value="${escapeHTML(task.title)}" placeholder="Título" aria-label="Editar título" />
      <input type="text" class="task-edit-input task-edit-desc"  value="${escapeHTML(task.description || '')}" placeholder="Descripción" aria-label="Editar descripción" />
    </div>
    <div class="task-actions">
      <button class="btn-icon btn-edit"   aria-label="Editar" title="Editar">✎</button>
      <button class="btn-icon btn-save"   aria-label="Guardar" title="Guardar" style="display:none">✓</button>
      <button class="btn-icon btn-delete" aria-label="Eliminar" title="Eliminar">✕</button>
    </div>
  `;

  // Toggle completado
  const checkbox = li.querySelector('.task-checkbox');
  const toggleComplete = async () => {
    const completed = !li.classList.contains('completed');
    const res = await apiFetch(`${API}/tasks/${task._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    });
    if (!res.ok) return;
    li.classList.toggle('completed', completed);
    checkbox.setAttribute('aria-checked', completed);
    updateCounter();
  };
  checkbox.addEventListener('click', toggleComplete);
  checkbox.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleComplete(); }
  });

  // Edición inline
  const btnEdit   = li.querySelector('.btn-edit');
  const btnSave   = li.querySelector('.btn-save');
  const editTitle = li.querySelector('.task-edit-title');
  const editDesc  = li.querySelector('.task-edit-desc');

  btnEdit.addEventListener('click', () => {
    li.classList.add('editing');
    btnEdit.style.display = 'none';
    btnSave.style.display = 'flex';
    editTitle.focus();
  });

  btnSave.addEventListener('click', async () => {
    const newTitle = editTitle.value.trim();
    if (!newTitle) { editTitle.focus(); return; }

    const res = await apiFetch(`${API}/tasks/${task._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: newTitle, description: editDesc.value.trim() })
    });
    if (!res.ok) return;

    li.querySelector('.task-title').textContent = newTitle;
    li.querySelector('.task-desc').textContent  = editDesc.value.trim();
    li.classList.remove('editing');
    btnEdit.style.display = 'flex';
    btnSave.style.display = 'none';
  });

  [editTitle, editDesc].forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  btnSave.click();
      if (e.key === 'Escape') {
        li.classList.remove('editing');
        btnEdit.style.display = 'flex';
        btnSave.style.display = 'none';
      }
    });
  });

  // Mover a papelera
  li.querySelector('.btn-delete').addEventListener('click', async () => {
    const res = await apiFetch(`${API}/tasks/${task._id}/trash`, { method: 'PATCH' });
    if (!res.ok) return;
    li.style.transition = 'opacity 0.2s, transform 0.2s';
    li.style.opacity    = '0';
    li.style.transform  = 'translateX(20px)';
    setTimeout(() => { li.remove(); updateCounter(); checkEmptyState(); }, 200);
  });

  return li;
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const user  = getUser();

  if (token && user) {
    showApp(user);
  } else {
    showAuth();
  }

  // Agregar tarea
  function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    const desc  = document.getElementById('descriptionInput').value.trim();
    if (!title) { document.getElementById('taskInput').focus(); return; }

    apiFetch(`${API}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, description: desc })
    }).then(async res => {
      if (!res.ok) return;
      const task = await res.json();
      const list = document.getElementById('taskList');
      list.prepend(createTaskElement(task));
      document.getElementById('taskInput').value       = '';
      document.getElementById('descriptionInput').value = '';
      document.getElementById('taskInput').focus();
      updateCounter();
      checkEmptyState();
    });
  }

  document.getElementById('addTaskBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
});

// ── Service Worker ────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.warn('SW error:', err));
  });
}
