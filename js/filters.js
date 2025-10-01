// Функции для работы с фильтрами

// Инициализация аккордеона локаций
function initLocationsAccordion() {
    const container = document.getElementById('locations-accordion');
    
    locationsData.forEach(location => {
        const accordionId = generateAccordionId(location.name);
        
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        
        // Заголовок аккордеона
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `${location.name} <span>▼</span>`;
        header.onclick = () => toggleAccordion(accordionId);
        
        // Контент аккордеона
        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.id = accordionId;
        
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        
        // Добавляем чекбоксы в зависимости от типа локации
        if (location.type === 'city' && location.districts) {
            location.districts.forEach(district => {
                checkboxGroup.appendChild(createCheckboxElement(
                    district, 
                    district,
                    district !== "Минск (все районы)"
                ));
            });
        } else if (location.type === 'region' && location.cities) {
            location.cities.forEach(city => {
                checkboxGroup.appendChild(createCheckboxElement(
                    city,
                    city,
                    city !== `${location.name} (вся)`
                ));
            });
        }
        
        content.appendChild(checkboxGroup);
        accordion.appendChild(header);
        accordion.appendChild(content);
        container.appendChild(accordion);
    });
}

// Открытие модального окна фильтра
function openFilterModal() {
    // Заполняем поля текущими значениями
    document.getElementById('price-max').value = filterSettings.numeric_ranges.price.max;
    document.getElementById('zazor-min').value = filterSettings.numeric_ranges.zazor.min;
    
    // Сбрасываем все чекбоксы
    document.querySelectorAll('input[name="location"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Устанавливаем выбранные локации
    filterSettings.categorical.location.values.forEach(location => {
        const checkbox = document.querySelector(`input[name="location"][value="${location}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    document.getElementById('filter-modal').classList.add('active');
}

// Закрытие модального окна фильтра
function closeFilterModal() {
    document.getElementById('filter-modal').classList.remove('active');
}

// Сохранение настроек фильтра
function saveFilterSettings() {
    // Сохраняем числовые значения
    filterSettings.numeric_ranges.price.max = parseInt(document.getElementById('price-max').value) || 0;
    filterSettings.numeric_ranges.zazor.min = parseInt(document.getElementById('zazor-min').value) || 0;

    // Сохраняем выбранные локации
    const selectedLocations = Array.from(document.querySelectorAll('input[name="location"]:checked'))
                                .map(checkbox => checkbox.value);
    filterSettings.categorical.location.values = selectedLocations;

    updateFilterPreview();
    closeFilterModal();
    
    console.log("Сохраненные настройки:", JSON.stringify(filterSettings, null, 2));
    showNotification('Настройки фильтра сохранены', 'success');
}

// Обновление превью фильтра
function updateFilterPreview() {
    const preview = document.getElementById('filter-preview');
    const price = filterSettings.numeric_ranges.price;
    const zazor = filterSettings.numeric_ranges.zazor;
    const locations = filterSettings.categorical.location.values;
    
    let locationText = locations.length > 2 ? 
        `${locations.slice(0, 2).join(', ')}...` : 
        locations.join(', ');
    
    preview.textContent = `Макс. цена: ${price.max} руб, Мин. зазор: ${zazor.min} мм, Локации: ${locationText}`;
}