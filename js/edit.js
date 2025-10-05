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
        renderLocationChips(filter.categorical.location.values || []);
    }

    function collectToFilter(filter) {
        filter.name = document.getElementById('filter-name').value || filter.name;
        filter.numeric_ranges.price.max = parseInt(document.getElementById('price-max').value) || 0;
        filter.numeric_ranges.zazor.min = parseInt(document.getElementById('zazor-min').value) || 0;
        // values already managed via chips selector
        return filter;
    }

    function renderLocationChips(values){
        const preview = document.getElementById('selected-locations-preview');
        if (!preview) return;
        preview.innerHTML = '';
        if (!Array.isArray(values) || values.length === 0){
            const empty = document.createElement('div');
            empty.className = 'filter-preview';
            empty.textContent = 'Локации не выбраны';
            preview.appendChild(empty);
            return;
        }
        values.forEach((name)=>{
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = name;
            const btn = document.createElement('button');
            btn.className = 'chip-remove';
            btn.setAttribute('aria-label','Удалить локацию');
            btn.textContent = '×';
            btn.onclick = function(e){
                e.preventDefault();
                const id = getParam('id');
                const filter = findFilterById(id);
                if (!filter) return;
                const next = (filter.categorical.location.values || []).filter(v => v !== name);
                filter.categorical.location.values = next;
                saveFilter(filter);
                renderLocationChips(next);
            };
            chip.appendChild(btn);
            preview.appendChild(chip);
        });
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
        // удален устаревший аккордеон
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

        // Attach LocationSelector panel and wire to a button
        const root = document.body;
        const selector = LocationSelector(root);
        selector.onApply((values)=>{
            const currentId = getParam('id');
            const current = findFilterById(currentId);
            if (!current) return;
            current.categorical.location.values = values;
            saveFilter(current);
            fillFromFilter(current);
        });

        // Create a button to open selector
        const openBtn = document.getElementById('open-location-selector');
        if (openBtn) {
            openBtn.addEventListener('click', ()=>{
                const currentId = getParam('id');
                const current = findFilterById(currentId);
                const initVals = current?.categorical?.location?.values || [];
                selector.open(initVals);
            });
            // initial preview
            const currentId = getParam('id');
            const current = findFilterById(currentId);
            renderLocationChips(current?.categorical?.location?.values || []);
            selector.onApply((values)=>{
                const cid = getParam('id');
                const cur = findFilterById(cid);
                if (!cur) return;
                cur.categorical.location.values = values;
                saveFilter(cur);
                renderLocationChips(values);
            });
        }
    });
})();


