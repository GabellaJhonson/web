// Функции для работы с фильтрами и списком

const FILTERS_KEY = 'filters';
const ACTIVE_FILTER_KEY = 'activeFilterId';

function loadFilters() {
    try {
        const raw = localStorage.getItem(FILTERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

function saveFilters(filters) {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

function getActiveFilterId() {
    return localStorage.getItem(ACTIVE_FILTER_KEY);
}

function setActiveFilterId(filterId) {
    if (filterId == null) {
        localStorage.removeItem(ACTIVE_FILTER_KEY);
    } else {
        localStorage.setItem(ACTIVE_FILTER_KEY, String(filterId));
    }
}

function ensureDefaultFilter() {
    const filters = loadFilters();
    if (filters.length === 0) {
        const defaultFilter = createFilterObject('Айфоны с зазором по всей РБ');
        saveFilters([defaultFilter]);
        setActiveFilterId(defaultFilter.id);
        return [defaultFilter];
    }
    return filters;
}

function createFilterObject(name) {
    return {
        id: Date.now(),
        name: name || 'Айфоны в Минске',
        numeric_ranges: {
            price: { max: 5000 },
            zazor: { min: 100 }
        },
        categorical: {
            location: { values: ["Вся Беларусь"] }
        }
    };
}

function renderFiltersList() {
    const container = document.getElementById('filters-list');
    if (!container) return;
    const filters = ensureDefaultFilter();
    const activeId = getActiveFilterId();
    container.innerHTML = '';

    filters.forEach(filter => {
        const card = document.createElement('div');
        card.className = 'filter-card';
        card.onclick = () => goToEdit(filter.id);

        const header = document.createElement('div');
        header.className = 'filter-header';

        const title = document.createElement('div');
        title.className = 'filter-title';
        title.textContent = filter.name;

        const isActive = String(activeId) === String(filter.id);

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'activeFilterRadio';
        radio.className = 'filter-active-radio';
        radio.checked = isActive;
        radio.title = 'Сделать активным';
        radio.onclick = (e) => {
            e.stopPropagation();
            setActiveFilterId(filter.id);
            renderFiltersList();
        };

        header.appendChild(title);
        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        if (isActive) {
            const activeLabel = document.createElement('span');
            activeLabel.className = 'filter-active-label';
            activeLabel.textContent = 'Active   ';
            right.appendChild(activeLabel);
        }
        right.appendChild(radio);
        header.appendChild(right);

        const preview = document.createElement('div');
        preview.className = 'filter-preview';
        const price = filter.numeric_ranges.price;
        const zazor = filter.numeric_ranges.zazor;
        const locations = filter.categorical.location.values;
        const locationText = locations.length > 2 ? `${locations.slice(0,2).join(', ')}...` : locations.join(', ');
        preview.textContent = `Макс. цена: ${price.max} руб, Мин. зазор: ${zazor.min} мм, Локации: ${locationText}`;

        card.appendChild(header);
        card.appendChild(preview);
        container.appendChild(card);
    });
}

function createNewFilter() {
    const name = prompt('Название фильтра', 'Новый фильтр');
    const filters = loadFilters();
    const filter = createFilterObject(name || 'Новый фильтр');
    filters.push(filter);
    saveFilters(filters);
    setActiveFilterId(filter.id);
    renderFiltersList();
    goToEdit(filter.id);
}

function goToEdit(filterId) {
    window.location.href = `edit.html?id=${encodeURIComponent(filterId)}`;
}

// Удален устаревший аккордеон локаций
