<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Администрирование инструкций — 1С:Университет</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* ---------- Локальные стили админ-панели ---------- */

    body {
      background-color: #f8f9fa;
    }

    .admin-header {
      background-color: #1a3a5c;
      color: #fff;
      padding: 24px 0;
      border-bottom: 4px solid #2e6da4;
    }

    .admin-header h1 {
      font-size: 22px;
      font-weight: 600;
    }

    .admin-header p {
      font-size: 14px;
      opacity: 0.85;
      margin-top: 4px;
    }

    .admin-container {
      max-width: 900px;
      margin: 40px auto;
      padding: 32px;
      background: #fff;
      border: 1px solid #e0e6ed;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .admin-container h1 {
      color: #1a3a5c;
      margin-bottom: 24px;
      font-size: 22px;
    }

    .admin-container h2 {
      margin-top: 34px;
      font-size: 18px;
      color: #1a3a5c;
      padding-bottom: 8px;
      border-bottom: 1px solid #eef2f6;
    }

    /* ---------- Формы ---------- */

    .form-group {
      margin-bottom: 18px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: #1a3a5c;
      font-size: 14px;
    }

    .form-group select,
    .form-group input[type="text"],
    .form-group input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #c0cdd9;
      border-radius: 4px;
      font-size: 15px;
      background: #fff;
      color: #1e2a3a;
      font-family: inherit;
    }

    .form-group select:focus,
    .form-group input:focus {
      outline: none;
      border-color: #2e6da4;
      box-shadow: 0 0 0 2px rgba(46, 109, 164, 0.15);
    }

    /* ---------- Кнопки ---------- */

    .btn {
      display: inline-block;
      background: #2e6da4;
      color: #fff;
      border: none;
      padding: 11px 22px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }

    .btn:hover {
      background: #1a3a5c;
    }

    .btn-danger {
      background: #b03030;
    }

    .btn-danger:hover {
      background: #8a2020;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 13px;
    }

    /* ---------- Карточка подраздела ---------- */

    .subsection-card {
      border: 1px solid #e0e6ed;
      border-radius: 6px;
      margin-bottom: 18px;
      overflow: hidden;
      background: #fff;
    }

    .subsection-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: #f4f7fb;
      border-bottom: 1px solid #e0e6ed;
      gap: 12px;
    }

    .subsection-card-header .title {
      font-weight: 600;
      color: #1a3a5c;
      font-size: 15px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .subsection-card-body {
      padding: 16px 18px;
    }

    .subsection-card-body h4 {
      font-size: 14px;
      color: #1a3a5c;
      margin-bottom: 10px;
      font-weight: 600;
    }

    /* ---------- Список файлов ---------- */

    .file-admin-list {
      list-style: none;
      padding: 0;
      margin: 0 0 14px 0;
    }

    .file-admin-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      border: 1px solid #e0e6ed;
      border-radius: 4px;
      margin-bottom: 6px;
      background: #f9fbfd;
      gap: 10px;
    }

    .file-admin-item .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .file-admin-item .file-info span {
      font-size: 14px;
      color: #2c3e50;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-admin-item .file-path {
      font-size: 12px;
      color: #8a9aa8;
      margin-left: 4px;
    }

    .no-files-hint {
      font-size: 13px;
      color: #8a9aa8;
      font-style: italic;
      margin-bottom: 12px;
    }

    /* ---------- Блок загрузки ---------- */

    .upload-row {
      display: flex;
      gap: 10px;
      align-items: stretch;
      flex-wrap: wrap;
    }

    .upload-row input[type="file"] {
      flex: 1;
      min-width: 220px;
      padding: 8px 10px;
      border: 1px dashed #c0cdd9;
      border-radius: 4px;
      background: #fff;
      font-size: 13px;
      color: #2c3e50;
      cursor: pointer;
      font-family: inherit;
    }

    .upload-row input[type="file"]:hover {
      border-color: #2e6da4;
      background: #f7fafd;
    }

    .hint {
      font-size: 12px;
      color: #6b7c8d;
      margin-top: 8px;
      line-height: 1.5;
    }

    /* ---------- Логин ---------- */

    .login-box {
      max-width: 420px;
      margin: 80px auto;
      padding: 40px 32px;
      background: #fff;
      border: 1px solid #e0e6ed;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      text-align: center;
    }

    .login-box h2 {
      color: #1a3a5c;
      font-size: 20px;
      margin-bottom: 8px;
    }

    .login-box p {
      color: #6b7c8d;
      font-size: 14px;
      margin-bottom: 22px;
    }

    .login-box input[type="password"] {
      width: 100%;
      padding: 11px 14px;
      border: 1px solid #c0cdd9;
      border-radius: 4px;
      font-size: 15px;
      margin-bottom: 14px;
      font-family: inherit;
    }

    .login-box input[type="password"]:focus {
      outline: none;
      border-color: #2e6da4;
      box-shadow: 0 0 0 2px rgba(46, 109, 164, 0.15);
    }

    .login-error {
      color: #b03030;
      margin-top: 12px;
      font-size: 13px;
      display: none;
    }

    /* ---------- Прочее ---------- */

    .empty-state {
      padding: 20px;
      text-align: center;
      color: #8a9aa8;
      font-size: 14px;
      font-style: italic;
    }

    code {
      background: #f0f4f8;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      color: #1a3a5c;
      font-family: Consolas, Monaco, monospace;
    }

    @media (max-width: 640px) {
      .admin-container {
        margin: 20px auto;
        padding: 20px;
      }

      .subsection-card-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .upload-row {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>

  <!-- ============ ШАПКА ============ -->
  <header class="admin-header">
    <div class="container">
      <h1>Администрирование инструкций 1С:Университет</h1>
      <p>Управление подразделами и прикреплёнными PDF-файлами</p>
    </div>
  </header>

  <!-- ============ ФОРМА ВХОДА ============ -->
  <div class="login-box" id="login-box">
    <h2>Вход для администратора</h2>
    <p>Введите пароль для доступа к панели управления</p>

    <input type="password" id="admin-password" placeholder="Пароль" autocomplete="current-password">

    <button class="btn" id="login-btn" style="width:100%;">Войти</button>

    <p class="login-error" id="login-error">Неверный пароль</p>
  </div>

  <!-- ============ ОСНОВНАЯ ПАНЕЛЬ ============ -->
  <div class="admin-container" id="admin-panel" style="display:none;">

    <h1>Управление подразделами и файлами</h1>

    <!-- Выбор раздела -->
    <div class="form-group">
      <label for="section-select">Раздел</label>
      <select id="section-select"></select>
    </div>

    <!-- Добавление нового подраздела -->
    <div class="form-group">
      <label for="subsection-title">Название нового подраздела</label>
      <input
        type="text"
        id="subsection-title"
        placeholder="Например: Создание приказа"
        autocomplete="off"
      >
    </div>

    <button class="btn" id="add-btn">Добавить подраздел</button>

    <!-- Список существующих подразделов и файлов -->
    <h2>Существующие подразделы и прикреплённые файлы</h2>
    <div id="subsection-list-admin">
      <p class="empty-state">Загрузка…</p>
    </div>

    <!-- Информация о сохранении -->
    <p class="hint" style="margin-top:24px;">
      После любых изменений автоматически скачивается обновлённый
      <code>instructions.json</code>. Замените его в папке <code>data/</code>,
      а скачанные PDF-файлы положите в папку <code>files/</code>.
    </p>
  </div>

  <script src="js/admin.js"></script>
</body>
</html>
