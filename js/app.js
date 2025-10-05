// Основной файл приложения

// Данные фильтров теперь хранятся в localStorage (см. js/filters.js)

// Переключение вкладок
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// Инициализация приложения
function initApp() {
    // Рендерим список фильтров
    renderFiltersList();

    // Инициализация Telegram Web App (если используется в Telegram)
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        const chatId = Telegram.WebApp.initDataUnsafe?.chat?.id;
        if (chatId) {
            document.getElementById('chatId').innerText = chatId;
        } else {
            document.getElementById('chatId').innerText = 'Не доступен';
        }
    }

    console.log('Приложение инициализировано');
}


// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);