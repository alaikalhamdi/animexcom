function switchToMapBuilder() {
    mapBuilderMode = !mapBuilderMode;
    const button = document.getElementById('map-builder-button');
    const mapBuilderControls = document.getElementById('map-builder-controls');
    button.textContent = mapBuilderMode ? 'Switch to Game Mode' : 'Map Builder Mode';
    mapBuilderControls.style.display = mapBuilderMode ? 'block' : 'none';
    console.log(mapBuilderMode ? 'Switched to Map Builder Mode' : 'Switched to Game Mode');
}

function toggleMapBuilderItem(item) {
    if (item.classList.contains('unit')) {
        item.classList.remove('unit');
        removeHealthBar(item);
    } else if (item.classList.contains('enemy')) {
        item.classList.remove('enemy');
        removeHealthBar(item);
    } else if (item.classList.contains('obstacle')) {
        item.classList.remove('obstacle');
    } else if (item.classList.contains('spawn-point')) {
        item.classList.remove('spawn-point');
        spawnPoints = spawnPoints.filter(point => point !== item);
    } else {
        const type = prompt('Enter type (unit/enemy/obstacle/spawn-point):');
        if (type === 'unit') {
            item.classList.add('unit');
            item.setAttribute('data-health', unitHealth);
            addHealthBar(item, unitHealth);
            totalUnits++;
            updateUnitsLeftDisplay();
        } else if (type === 'enemy') {
            item.classList.add('enemy');
            item.setAttribute('data-health', enemyHealth);
            addHealthBar(item, enemyHealth);
        } else if (type === 'obstacle') {
            const obtype = prompt('Enter cover type (full/partial):');
            if (obtype === 'full') {
                item.classList.add('obstacle');
                item.classList.add('full-cover');
            } else if (obtype === 'partial') {
                item.classList.add('partial-cover');
            }
        } else if (type === 'spawn-point') {
            item.classList.add('spawn-point');
            spawnPoints.push(item);
        }
    }
}

function exportMap() {
    const mapData = {
        length: GRID_LENGTH,
        width: GRID_WIDTH,
        cells: []
    };
    document.querySelectorAll('.grid-item').forEach(item => {
        const cellData = {
            unit: item.classList.contains('unit'),
            enemy: item.classList.contains('enemy'),
            obstacle: item.classList.contains('obstacle'),
            spawnPoint: item.classList.contains('spawn-point'),
            health: item.getAttribute('data-health'),
            unitId: item.getAttribute('data-id'),
            mp: item.getAttribute('data-mp'),
            coverType: item.classList.contains('full-cover') ? 'full' : item.classList.contains('partial-cover') ? 'partial' : null
        };
        mapData.cells.push(cellData);
    });
    const json = JSON.stringify(mapData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importMap(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const mapData = JSON.parse(e.target.result);
        GRID_LENGTH = mapData.length;
        GRID_WIDTH = mapData.width;
        generateGrid(GRID_LENGTH, GRID_WIDTH, mapData.cells);
    };
    reader.readAsText(file);
}