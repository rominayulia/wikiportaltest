const ADMIN_PASSWORD = '1c-university-admin'; // замените на свой пароль

let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-btn').addEventListener('click', tryLogin);
  document.getElementById('admin-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryLogin();
  });
});

function tryLogin() {
  const input = document.getElementById('admin-password').value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadDataForAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

async function loadDataForAdmin() {
  const response = await fetch('data/instructions.json');
  currentData = await response.json();

  const select = document.getElementById('section-select');
  select.innerHTML = '';
  currentData.sections.forEach(section => {
    const option = document.createElement('option');
    option.value = section.id;
    option.textContent = section.title;
    select.appendChild(option);
  });

  renderAdminSubsections();

  document.getElementById('add-btn').addEventListener('click', addSubsection);
  select.addEventListener('change', renderAdminSubsections);
}

function renderAdminSubsections() {
  const sectionId = document.getElementById('section-select').value;
  const section = currentData.sections.find(s => s.id === sectionId);
  const container = document.getElementById('subsection-list-admin');
  container.innerHTML = '';

  if (!section || !section.subsections || section.subsections.length === 0) {
    container.innerHTML = '<p style="color:#8a9aa8;">Подразделов пока нет.</p>';
    return;
  }

  section.subsections.forEach((sub, index) => {
    const div = document.createElement('div');
    div.className = 'subsection-item';
    div.innerHTML = `
      <span>${sub.title}</span>
      <button class="btn btn-danger" data-index="${index}">Удалить</button>
    `;
    div.querySelector('.btn-danger').addEventListener('click', () => {
      section.subsections.splice(index, 1);
      saveAndRender();
    });
    container.appendChild(div);
  });
}

function addSubsection() {
  const sectionId = document.getElementById('section-select').value;
  const title = document.getElementById('subsection-title').value.trim();

  if (!title) {
    alert('Введите название подраздела.');
    return;
  }

  const section = currentData.sections.find(s => s.id === sectionId);
  if (!section) return;

  if (!section.subsections) section.subsections = [];

  const id = title.toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 40) + '-' + Date.now();

  section.subsections.push({ id, title });
  document.getElementById('subsection-title').value = '';
  saveAndRender();
}

function saveAndRender() {
  // В статическом сайте сохранение в файл невозможно без сервера.
  // Поэтому данные обновляются в памяти, а администратор может скачать JSON.
  const jsonStr = JSON.stringify(currentData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'instructions.json';
  a.click();
  URL.revokeObjectURL(url);

  renderAdminSubsections();
  alert('Файл instructions.json сформирован и скачан. Замените его в папке data/.');
}
