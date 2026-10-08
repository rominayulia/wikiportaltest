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
    if (!sub.files) sub.files = [];

    const block = document.createElement('div');
    block.className = 'subsection-item-block';

    // Заголовок подраздела + кнопка удаления
    const header = document.createElement('div');
    header.className = 'subsection-item';
    header.innerHTML = `
      <span style="font-weight:600;color:#1a3a5c;">${sub.title}</span>
      <div class="actions">
        <button class="btn btn-danger" data-del-index="${index}">Удалить подраздел</button>
      </div>
    `;
    header.querySelector('[data-del-index]').addEventListener('click', () => {
      if (confirm(`Удалить подраздел «${sub.title}» со всеми файлами?`)) {
        section.subsections.splice(index, 1);
        saveAndRender();
      }
    });

    // Блок прикреплённых файлов
    const filesBlock = document.createElement('div');
    filesBlock.className = 'files-block';

    let filesHtml = '<h4>Прикреплённые PDF-файлы:</h4>';
    if (sub.files.length === 0) {
      filesHtml += '<p class="hint">Файлов пока нет.</p>';
    } else {
      filesHtml += sub.files.map((f, fi) => `
        <div class="file-admin-item">
          <span>📄 ${f.name}</span>
          <button class="btn btn-danger" data-file-index="${fi}" data-sub-index="${index}">Удалить</button>
        </div>
      `).join('');
    }

    filesHtml += `
      <div class="upload-row">
        <input type="file" accept="application/pdf" multiple data-upload-index="${index}">
        <button class="btn" data-upload-btn="${index}">Прикрепить PDF</button>
      </div>
      <p class="hint">Можно выбрать несколько PDF-файлов сразу. После прикрепления скачайте обновлённый <code>instructions.json</code> и положите PDF-файлы в папку <code>files/</code>.</p>
    `;

    filesBlock.innerHTML = filesHtml;

    // Кнопки удаления файлов
    filesBlock.querySelectorAll('[data-file-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fi = parseInt(btn.dataset.fileIndex, 10);
        const si = parseInt(btn.dataset.subIndex, 10);
        if (confirm(`Удалить файл «${section.subsections[si].files[fi].name}»?`)) {
          section.subsections[si].files.splice(fi, 1);
          saveAndRender();
        }
      });
    });

    // Кнопка прикрепления файлов
    filesBlock.querySelector('[data-upload-btn]').addEventListener('click', () => {
      const si = parseInt(
        filesBlock.querySelector('[data-upload-btn]').dataset.uploadBtn,
        10
      );
      const input = filesBlock.querySelector(`[data-upload-index="${si}"]`);
      handleFilesUpload(section.subsections[si], input.files);
      input.value = '';
    });

    block.appendChild(header);
    block.appendChild(filesBlock);
    container.appendChild(block);
  });
}

/**
 * Обрабатывает выбранные PDF-файлы: сохраняет их названия в JSON
 * и предлагает скачать сам файл, чтобы администратор положил его в папку files/.
 */
function handleFilesUpload(subsection, fileList) {
  if (!fileList || fileList.length === 0) {
    alert('Файлы не выбраны.');
    return;
  }

  const added = [];
  for (const file of fileList) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert(`Файл «${file.name}» не является PDF и будет пропущен.`);
      continue;
    }

    // Формируем «безопасный» путь: files/<slug>.pdf
    const safeName = file.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Zа-яА-ЯёЁ0-9._-]/g, '');
    const path = `files/${safeName}`;

    // Проверяем, нет ли уже такого файла
    if (subsection.files.some(f => f.name === file.name)) {
      alert(`Файл «${file.name}» уже прикреплён к этому подразделу.`);
      continue;
    }

    subsection.files.push({ name: file.name, path });

    // Скачиваем сам PDF-файл, чтобы админ положил его в папку files/
    downloadBlob(file, file.name);
    added.push(file.name);
  }

  if (added.length > 0) {
    saveAndRender();
  }
}

/**
 * Скачивает файл (Blob) пользователю на диск.
 */
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

  section.subsections.push({ id, title, files: [] });
  document.getElementById('subsection-title').value = '';
  saveAndRender();
}

/**
 * Сохраняет структуру в JSON, скачивает файл instructions.json
 * и перерисовывает панель.
 */
function saveAndRender() {
  const jsonStr = JSON.stringify(currentData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, 'instructions.json');
  renderAdminSubsections();
}
