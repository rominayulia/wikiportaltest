// ============================================================
// Пароль администратора (замените на свой)
// ============================================================
const ADMIN_PASSWORD = '1c-university-admin';

// ============================================================
// Глобальное хранилище загруженной структуры
// ============================================================
let currentData = null;

// ============================================================
// Инициализация
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-btn').addEventListener('click', tryLogin);
  document.getElementById('admin-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryLogin();
  });
});

// ============================================================
// Вход по паролю
// ============================================================
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

// ============================================================
// Загрузка JSON для админки
// ============================================================
async function loadDataForAdmin() {
  try {
    const response = await fetch('data/instructions.json');
    if (!response.ok) throw new Error('Не удалось загрузить instructions.json');
    currentData = await response.json();

    // Заполняем выпадающий список разделов
    const select = document.getElementById('section-select');
    select.innerHTML = '';
    currentData.sections.forEach(section => {
      const option = document.createElement('option');
      option.value = section.id;
      option.textContent = section.title;
      select.appendChild(option);
    });

    // Первичная отрисовка подразделов
    renderAdminSubsections();

    // Обработчики
    document.getElementById('add-btn').addEventListener('click', addSubsection);
    select.addEventListener('change', renderAdminSubsections);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    document.getElementById('subsection-list-admin').innerHTML =
      '<p class="empty-state" style="color:#b03030;">Не удалось загрузить данные.</p>';
  }
}

// ============================================================
// Отрисовка карточек подразделов с файлами
// ============================================================
function renderAdminSubsections() {
  const sectionId = document.getElementById('section-select').value;
  const section = currentData.sections.find(s => s.id === sectionId);
  const container = document.getElementById('subsection-list-admin');
  container.innerHTML = '';

  if (!section || !section.subsections || section.subsections.length === 0) {
    container.innerHTML = '<p class="empty-state">Подразделов пока нет.</p>';
    return;
  }

  section.subsections.forEach((sub, index) => {
    // Убедимся, что у подраздела есть массив files
    if (!sub.files) sub.files = [];

    // -------- Карточка подраздела --------
    const card = document.createElement('div');
    card.className = 'subsection-card';

    // Заголовок карточки
    const header = document.createElement('div');
    header.className = 'subsection-card-header';
    header.innerHTML = `
      <span class="title">${escapeHtml(sub.title)}</span>
      <button class="btn btn-danger btn-small" data-del-index="${index}">
        Удалить подраздел
      </button>
    `;
    header.querySelector('[data-del-index]').addEventListener('click', () => {
      if (confirm(`Удалить подраздел «${sub.title}» со всеми файлами?`)) {
        section.subsections.splice(index, 1);
        saveAndRender();
      }
    });

    // Тело карточки
    const body = document.createElement('div');
    body.className = 'subsection-card-body';

    // ---- Список уже прикреплённых файлов ----
    let filesHtml = '<h4>Прикреплённые PDF-файлы:</h4>';

    if (sub.files.length === 0) {
      filesHtml += '<p class="no-files-hint">Файлов пока нет.</p>';
    } else {
      filesHtml += '<ul class="file-admin-list">';
      sub.files.forEach((file, fileIndex) => {
        filesHtml += `
          <li class="file-admin-item">
            <div class="file-info">
              <span>📄 ${escapeHtml(file.name)}</span>
              <span class="file-path">${escapeHtml(file.path)}</span>
            </div>
            <button class="btn btn-danger btn-small"
                    data-file-index="${fileIndex}"
                    data-sub-index="${index}">
              Удалить
            </button>
          </li>
        `;
      });
      filesHtml += '</ul>';
    }

    // ---- Блок загрузки новых файлов ----
    filesHtml += `
      <div class="upload-row">
        <input type="file"
               accept="application/pdf"
               multiple
               data-upload-index="${index}">
        <button class="btn" data-upload-btn="${index}">Прикрепить PDF</button>
      </div>
      <p class="hint">
        Можно выбрать несколько PDF-файлов сразу. После прикрепления
        скачайте обновлённый <code>instructions.json</code> и положите
        PDF-файлы в папку <code>files/</code>.
      </p>
    `;

    body.innerHTML = filesHtml;

    // ---- Обработчики удаления файлов ----
    body.querySelectorAll('[data-file-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fi = parseInt(btn.dataset.fileIndex, 10);
        const si = parseInt(btn.dataset.subIndex, 10);
        const fileName = section.subsections[si].files[fi].name;
        if (confirm(`Удалить файл «${fileName}»?`)) {
          section.subsections[si].files.splice(fi, 1);
          saveAndRender();
        }
      });
    });

    // ---- Обработчик прикрепления файлов ----
    const uploadBtn = body.querySelector('[data-upload-btn]');
    const fileInput = body.querySelector('[data-upload-index]');

    uploadBtn.addEventListener('click', () => {
      const si = parseInt(uploadBtn.dataset.uploadBtn, 10);
      handleFilesUpload(section.subsections[si], fileInput.files);
      fileInput.value = '';
    });

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  });
}

// ============================================================
// Обработка загруженных PDF-файлов
// ============================================================
function handleFilesUpload(subsection, fileList) {
  if (!fileList || fileList.length === 0) {
    alert('Файлы не выбраны.');
    return;
  }

  const added = [];

  for (const file of fileList) {
    // Проверка на PDF
    const isPdf = file.type === 'application/pdf' ||
                  file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      alert(`Файл «${file.name}» не является PDF и будет пропущен.`);
      continue;
    }

    // Формируем безопасный путь: files/<имя>.pdf
    const safeName = file.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Zа-яА-ЯёЁ0-9._-]/g, '');
    const path = `files/${safeName}`;

    // Проверка на дубликат по имени
    if (subsection.files.some(f => f.name === file.name)) {
      alert(`Файл «${file.name}» уже прикреплён к этому подразделу.`);
      continue;
    }

    subsection.files.push({ name: file.name, path });
    added.push(file.name);

    // Скачиваем сам файл, чтобы админ положил его в папку files/
    downloadBlob(file, file.name);
  }

  if (added.length > 0) {
    saveAndRender();
  }
}

// ============================================================
// Добавление нового подраздела
// ============================================================
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

  // Генерируем уникальный id
  const id = title.toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 40) + '-' + Date.now();

  section.subsections.push({ id, title, files: [] });
  document.getElementById('subsection-title').value = '';
  saveAndRender();
}

// ============================================================
// Сохранение: скачивание обновлённого instructions.json
// ============================================================
function saveAndRender() {
  const jsonStr = JSON.stringify(currentData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, 'instructions.json');
  renderAdminSubsections();
}

// ============================================================
// Утилита: скачивание Blob-файла
// ============================================================
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ============================================================
// Утилита: экранирование HTML во избежание XSS
// ============================================================
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
