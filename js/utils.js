// Утилиты для работы с DOM и общие функции

// Переключение аккордеона
function toggleAccordion(id) {
    const content = document.getElementById(id);
    content.classList.toggle('active');
}

// Генерация ID для аккордеона
function generateAccordionId(name) {
    return name.toLowerCase().replace(/\s+/g, '-') + '-accordion';
}

// Создание элемента чекбокса
function createCheckboxElement(value, label, isNested = false) {
    const labelElement = document.createElement('label');
    labelElement.className = `checkbox-label ${isNested ? 'nested' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'location';
    checkbox.value = value;
    
    labelElement.appendChild(checkbox);
    labelElement.appendChild(document.createTextNode(label));
    
    return labelElement;
}

// Показ уведомления
function showNotification(message, type = 'info') {
    // В будущем можно добавить красивые уведомления
    console.log(`${type}: ${message}`);
}