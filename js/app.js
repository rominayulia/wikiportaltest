document.addEventListener('DOMContentLoaded', () => {
  loadStructure();
});

async function loadStructure() {
  try {
    const response = await fetch('data/instructions.json');
    if (!response.ok) throw new Error('Не удалось загрузить структуру');
    const data = await response.json();
    renderSidebar(data.sections);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    document.getElementById('section-nav').innerHTML =
      '<p style="padding:20px;color:#a00;">Не удалось загрузить список разделов.</p>';
  }
}

function renderSidebar(sections) {
  const nav = document.getElementById('section-nav');
  nav.innerHTML = '';

  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';

    // Заголовок раздела
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

    // Обработчик раскрытия/закрытия раздела
    header.addEventListener('click', () => {
      const isOpen = subList.classList.contains('open');
      // Закрываем все открытые списки
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

function showInstruction(sectionId, subId, title) {
  const contentArea = document.getElementById('content-area');
  // Здесь можно загрузить реальный текст инструкции.
  // Пока отображается заглушка с названием.
  contentArea.innerHTML = `
    <h2>${title}</h2>
    <p><em>Раздел: ${sectionId} → ${subId}</em></p>
    <hr style="margin:20px 0;border:none;border-top:1px solid #eef2f6;">
    <p>Текст инструкции будет добавлен администратором.</p>
    <p>Для редактирования содержимого откройте файл <code>data/instructions.json</code> или воспользуйтесь панелью администратора.</p>
  `;
}

function highlightActive(activeLink) {
  document.querySelectorAll('.subsection-link').forEach(link => link.classList.remove('active'));
  activeLink.classList.add('active');
}
