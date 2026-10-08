function showInstruction(sectionId, subId, title) {
  const contentArea = document.getElementById('content-area');

  // Ищем подраздел в глобальной структуре
  const section = window.__sectionsData?.find(s => s.id === sectionId);
  const subsection = section?.subsections?.find(s => s.id === subId);
  const files = subsection?.files || [];

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
