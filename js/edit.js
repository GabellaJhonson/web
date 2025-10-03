(function() {
    function getParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function findFilterById(id) {
        const filters = loadFilters();
        return filters.find(f => String(f.id) === String(id));
    }

    function saveFilter(updated) {
        const filters = loadFilters();
        const idx = filters.findIndex(f => String(f.id) === String(updated.id));
        if (idx >= 0) {
            filters[idx] = updated;
            saveFilters(filters);
        }
    }

    function removeFilter(id) {
        const filters = loadFilters().filter(f => String(f.id) !== String(id));
        saveFilters(filters);
        const activeId = getActiveFilterId();
        if (String(activeId) === String(id)) {
            const nextActive = filters[0] ? filters[0].id : null;
            setActiveFilterId(nextActive);
        }
    }

    function fillFromFilter(filter) {
        document.getElementById('edit-title').textContent = filter.name;
        document.getElementById('filter-name').value = filter.name;
        document.getElementById('price-max').value = filter.numeric_ranges.price.max;
        document.getElementById('zazor-min').value = filter.numeric_ranges.zazor.min;
        document.querySelectorAll('input[name="location"]').forEach(cb => cb.checked = false);
        filter.categorical.location.values.forEach(val => {
            const cb = document.querySelector(`input[name="location"][value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }

    function collectToFilter(filter) {
        filter.name = document.getElementById('filter-name').value || filter.name;
        filter.numeric_ranges.price.max = parseInt(document.getElementById('price-max').value) || 0;
        filter.numeric_ranges.zazor.min = parseInt(document.getElementById('zazor-min').value) || 0;
        filter.categorical.location.values = Array.from(document.querySelectorAll('input[name="location"]:checked')).map(cb => cb.value);
        return filter;
    }

    window.saveEdit = function() {
        const id = getParam('id');
        const filter = findFilterById(id);
        if (!filter) return goBack();
        const updated = collectToFilter(filter);
        saveFilter(updated);
        goBack();
    };

    window.deleteFilter = function() {
        const id = getParam('id');
        if (confirm('Удалить фильтр?')) {
            removeFilter(id);
            goBack();
        }
    };

    window.goBack = function() {
        window.location.href = 'index.html';
    };

    document.addEventListener('DOMContentLoaded', function() {
        initLocationsAccordion();
        const id = getParam('id');
        const filter = findFilterById(id);
        if (!filter) {
            // Если пришли без id — создадим новый и сразу редактируем
            const created = createFilterObject('Новый фильтр');
            const list = loadFilters();
            list.push(created);
            saveFilters(list);
            fillFromFilter(created);
        } else {
            fillFromFilter(filter);
        }
    });
})();


