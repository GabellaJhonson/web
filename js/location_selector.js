(function(){
    function byRegion() {
        return locationsData.map(loc => {
            if (loc.type === 'city') {
                return {
                    id: loc.name.toLowerCase(),
                    name: loc.name,
                    cities: loc.districts || []
                };
            } else if (loc.type === 'region') {
                return {
                    id: loc.name.toLowerCase(),
                    name: loc.name,
                    cities: loc.cities || []
                };
            } else {
                return {
                    id: loc.name.toLowerCase(),
                    name: loc.name,
                    cities: []
                };
            }
        });
    }

    function createTag(text, onDelete){
        const d = document.createElement('span');
        d.className = 'ls-tag';
        d.innerHTML = `<span>${text}</span>`;
        const btn = document.createElement('button');
        btn.type='button';
        btn.textContent = '✕';
        btn.title='Удалить';
        btn.addEventListener('click', (e)=>{ e.stopPropagation(); onDelete(); });
        d.appendChild(btn);
        return d;
    }

    window.LocationSelector = function attachLocationSelector(root) {
        const DATA = byRegion();
        const state = {
            selected: new Map(), // key 'region:city'
            activeRegionId: DATA[0]?.id || null,
            onApply: null
        };

        // build DOM
        const backdrop = document.createElement('div');
        backdrop.className = 'ls-backdrop';
        backdrop.setAttribute('aria-hidden','true');
        const panel = document.createElement('div');
        panel.className = 'ls-panel';
        const left = document.createElement('div'); left.className = 'ls-col ls-left';
        const right = document.createElement('div'); right.className = 'ls-col ls-right';

        // Left: regions
        const regionsList = document.createElement('div');
        regionsList.className = 'ls-scroll';
        left.appendChild(regionsList);

        // Right: header, search, select-all, cities list, footer
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        const rightTitle = document.createElement('strong'); 
        rightTitle.textContent = DATA[0]?.name || '';
        const countText = document.createElement('div'); 
        countText.style.color = '#666'; 
        countText.style.fontSize = '13px'; 
        countText.textContent = '0 выбранных';
        header.appendChild(rightTitle); 
        header.appendChild(countText);

        const searchWrap = document.createElement('div'); searchWrap.className = 'ls-search';
        const search = document.createElement('input'); search.type='search'; search.placeholder='Поиск по городам...';
        searchWrap.appendChild(search);

        const selectAllRow = document.createElement('div'); 
        selectAllRow.style.display = 'none'; 
        selectAllRow.style.fontSize = '13px'; 
        selectAllRow.style.marginBottom = '8px'; 
        selectAllRow.style.display='flex'; 
        selectAllRow.style.alignItems='center'; 
        selectAllRow.style.gap='8px';
        const selectAllLabel = document.createElement('label');
        const selectAll = document.createElement('input'); selectAll.type='checkbox'; selectAll.className='checkbox';
        selectAllLabel.appendChild(selectAll); selectAllLabel.appendChild(document.createTextNode(' Выбрать всё'));
        selectAllRow.appendChild(selectAllLabel);

        const citiesList = document.createElement('div'); citiesList.className = 'ls-scroll'; citiesList.style.marginTop = '8px';

        const footer = document.createElement('div'); footer.className='ls-footer';
        const clearBtn = document.createElement('button'); clearBtn.className='btn-ghost'; clearBtn.type='button'; clearBtn.textContent='Очистить';
        const doneBtn = document.createElement('button'); doneBtn.className='btn-solid'; doneBtn.type='button'; doneBtn.textContent='Готово';
        footer.appendChild(clearBtn); footer.appendChild(doneBtn);

        right.appendChild(header);
        right.appendChild(searchWrap);
        right.appendChild(selectAllRow);
        right.appendChild(citiesList);
        right.appendChild(footer);

        panel.appendChild(left);
        panel.appendChild(right);
        backdrop.appendChild(panel);
        root.appendChild(backdrop);

        function getRegionById(id){ return DATA.find(r=>r.id===id); }

        function updateCount(){
            const total = Array.from(state.selected.keys()).filter(k=>k.includes(':')).length;
            countText.textContent = `${total} выбранных`;
        }

        function renderRegions(){
            regionsList.innerHTML = '';
            DATA.forEach(region=>{
                const div = document.createElement('div');
                div.className = 'ls-region-item' + (region.id===state.activeRegionId?' active':'');
                div.tabIndex = 0; div.dataset.id = region.id;
                const row = document.createElement('div');
                row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center';
                const nameSpan = document.createElement('span'); nameSpan.textContent = region.name;
                const countSmall = document.createElement('small'); countSmall.style.color='#666'; countSmall.textContent = region.cities?.length ? String(region.cities.length) : '';
                row.appendChild(nameSpan); row.appendChild(countSmall);
                div.appendChild(row);
                div.addEventListener('click', ()=>{ state.activeRegionId = region.id; search.value=''; renderRegions(); renderCities(); });
                regionsList.appendChild(div);
            });
        }

        function renderCities(){
            const region = getRegionById(state.activeRegionId) || DATA[0];
            rightTitle.textContent = region?.name || '';
            if (region?.cities && region.cities.length) {
                selectAllRow.style.display = 'flex';
                const allSel = region.cities.every(city => state.selected.has(region.id + ':' + city));
                selectAll.checked = allSel;
            } else {
                selectAllRow.style.display = 'none';
            }

            const q = search.value.trim().toLowerCase();
            citiesList.innerHTML = '';
            if (!region?.cities || !region.cities.length) {
                const empty = document.createElement('div'); empty.style.color='#666'; empty.style.fontSize='13px'; empty.textContent='Нет городов для выбора';
                citiesList.appendChild(empty); updateCount(); return;
            }
            region.cities.forEach(city=>{
                if (q && !city.toLowerCase().includes(q)) return;
                const key = region.id + ':' + city;
                const isChecked = state.selected.has(key);
                const item = document.createElement('label');
                item.className = 'ls-city-item' + (isChecked ? ' active' : '');
                item.style.display = 'flex'; item.style.alignItems = 'center'; item.style.gap = '8px';
                const input = document.createElement('input'); input.type = 'checkbox'; input.className='checkbox'; input.dataset.key = key; input.checked = isChecked;
                const span = document.createElement('span'); span.textContent = city;
                item.appendChild(input); item.appendChild(span);
                input.addEventListener('change', (e)=>{
                    const checked = e.target.checked;
                    if (checked) state.selected.set(key, true);
                    else state.selected.delete(key);
                    updateCount(); renderCities();
                });
                citiesList.appendChild(item);
            });
            updateCount();
        }

        // handlers
        backdrop.addEventListener('click', (e)=>{ if (e.target === backdrop) close(); });
        clearBtn.addEventListener('click', ()=>{ state.selected.clear(); renderCities(); updateCount(); });
        doneBtn.addEventListener('click', ()=>{ if (typeof state.onApply === 'function') state.onApply(getSelected()); close(); });
        selectAll.addEventListener('change', (e)=>{
            const checked = e.target.checked; const region = getRegionById(state.activeRegionId);
            if (!region || !region.cities) return;
            region.cities.forEach(city=>{
                const key = region.id + ':' + city;
                if (checked) state.selected.set(key,true); else state.selected.delete(key);
            });
            renderCities(); updateCount();
        });
        search.addEventListener('input', ()=> renderCities());

        function getSelected(){
            const result = [];
            state.selected.forEach((_, key)=>{
                const [, city] = key.split(':');
                result.push(city);
            });
            return result;
        }

        function open(initialValues){
            state.selected.clear();
            if (Array.isArray(initialValues)) {
                initialValues.forEach(name=>{
                    DATA.forEach(region=>{
                        if (region.cities && region.cities.includes(name)) {
                            state.selected.set(region.id + ':' + name, true);
                        }
                    });
                });
            }
            renderRegions(); renderCities(); updateCount();
            backdrop.style.display='flex'; backdrop.setAttribute('aria-hidden','false');
        }
        function close(){ backdrop.style.display='none'; backdrop.setAttribute('aria-hidden','true'); }

        return { open, close, onApply: fn => (state.onApply = fn) };
    };
})();
