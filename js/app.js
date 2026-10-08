// ============================================================
// Глобальное хранилище структуры разделов и подразделов.
// Заполняется в loadStructure(), читается в showInstruction().
// ============================================================
window.__sectionsData = [];

document.addEventListener('DOMContentLoaded', () => {
  loadStructure();
});

// ============================================================
// Загрузка структуры из JSON
// ============================================================
async function loadStructure() {
  try {
    const response = await fetch('data/instructions.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: не удалось загрузить структуру`);
    }
    const data = await response.json();

    // >>>>>>>>> КЛЮЧЕВАЯ СТРОКА <<<<<<<<<
    // Сохраняем массив sections в глобальную переменную,
    // чтобы к нему имели доступ другие функции (showInstruction).
    window.__sectionsData = data.sections || [];

    // Отрисовываем боковое меню
    renderSidebar(window.__sectionsData);
  } catch (error) {
    console.error('Ошибка загрузки структуры:', error);
    document.getElementById('section-nav').innerHTML =
      '<p style="padding:20px;color:#a00;">Не удалось загрузить список разделов.</p>';
  }
}

// ============================================================
// Отрисовка бокового меню
// ============================================================
function renderSidebar(sections) {
  const nav = document.getElementById('section-nav');
  nav.innerHTML = '';

  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';

    // Заголовок раздела (кликабельный, раскрывает подразделы)
    const header = document.createElement('button');
    header.className = 'section-header';
    header.innerHTML = `
      <span>${section.title}</span>
      <span class="arrow">▶</span>
    `;

    // Список подразделов
    const subList = document.createElement('ul');
    subList.className = 'subsection-list';

    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach(sub => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'subsection-link';
        link.href = '#';
        link.textContent = sub.title;

        // Передаём в датасеты минимально нужные идентификаторы.
        // Сами данные функция showInstruction возьмёт из window.__sectionsData.
        link.dataset.subId = sub.id;
        link.dataset.sectionId = section.id;

        link.addEventListener('click', (e) => {
          e.preventDefault();
          showInstruction(section.id, sub.id, sub.title);
          highlightActive(link);
        });

        li.appendChild(link);
        subList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.innerHTML = '<span style="padding:10px 20px 10px 40px;display:block;color:#8a9aa8;font-size:13px;">Инструкции ещё не добавлены</span>';
      subList.appendChild(li);
    }

    // Раскрытие / закрытие раздела
    header.addEventListener('click', () => {
      const isOpen = subList.classList.contains('open');
      // Закрываем все ранее открытые подсписки
      document.querySelectorAll('.subsection-list.open').forEach(el => el.classList.remove('open'));
      document.querySelectorAll('.section-header.open').forEach(el => el.classList.remove('open'));

      if (!isOpen) {
        subList.classList.add('open');
        header.classList.add('open');
      }
    });

    sectionDiv.appendChild(header);
    sectionDiv.appendChild(subList);
    nav.appendChild(sectionDiv);
  });
}

// ============================================================
// Показ инструкции выбранного подраздела + список PDF-файлов
// ============================================================
function showInstruction(sectionId, subId, title) {
  const contentArea = document.getElementById('content-area');

  // Ищем раздел и подраздел в глобальной структуре,
  // сохранённой в loadStructure().
  const section = window.__sectionsData.find(s => s.id === sectionId);
  const subsection = section?.subsections?.find(s => s.id === subId);

  // Массив файлов (может быть пустым или отсутствовать — тогда [])
  const files = subsection?.files || [];

  // Готовим HTML со списком файлов
  let filesHtml = '';
  if (files.length > 0) {
    filesHtml = `
      <h3 class="files-title">Прикреплённые файлы (PDF)</h3>
      <ul class="files-list">
        ${files.map(f => `
          <li class="file-item">
            <span class="file-icon">📄</span>
            <a href="${f.path}" target="_blank" rel="noopener" class="file-link">${f.name}</a>
            <a href="${f.path}" download class="file-download">Скачать</a>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    filesHtml = `<p class="no-files">К этому подразделу файлы пока не прикреплены.</p>`;
  }

  contentArea.innerHTML = `
    <h2>${title}</h2>
    <p class="breadcrumbs">${section?.title || sectionId} → ${title}</p>
    <hr class="divider">
    <p>Текст инструкции будет добавлен администратором.</p>
    ${filesHtml}
  `;
}

// ============================================================
// Подсветка активного пункта меню
// ============================================================
function highlightActive(activeLink) {
  document.querySelectorAll('.subsection-link').forEach(link => link.classList.remove('active'));
  activeLink.classList.add('active');
}
