import { addHealthBar, removeHealthBar, updateUnitsLeftDisplay } from './modules/ui.js';
import { generateGrid } from './modules/generateGrid.js';

function toggleMapBuilderItem(item) {
    if (item.classList.contains('unit')) {
        item.classList.remove('unit');
        item.style.backgroundColor = 'lightgray';
        removeHealthBar(item);
    } else if (item.classList.contains('enemy')) {
        item.classList.remove('enemy');
        item.style.backgroundColor = 'lightgray';
        removeHealthBar(item);
    } else if (item.classList.contains('obstacle')) {
        item.classList.remove('obstacle');
        item.style.backgroundColor = 'lightgray';
    } else if (item.classList.contains('spawn-point')) {
        item.classList.remove('spawn-point');
        item.style.backgroundColor = 'lightgray';
        spawnPoints = spawnPoints.filter(point => point !== item);
    } else {
        const type = prompt('Enter type (unit/enemy/obstacle/spawn-point):');
        if (type === 'unit') {
            item.classList.add('unit');
            item.style.backgroundColor = 'blue';
            item.setAttribute('data-health', unitHealth);
            addHealthBar(item, unitHealth);
            totalUnits++;
            updateUnitsLeftDisplay();
        } else if (type === 'enemy') {
            item.classList.add('enemy');
            item.style.backgroundColor = 'red';
            item.setAttribute('data-health', enemyHealth);
            addHealthBar(item, enemyHealth);
        } else if (type === 'obstacle') {
            const obtype = prompt('Enter cover type (full/partial):');
            if (obtype === 'full') {
                item.classList.add('obstacle');
                item.classList.add('full-cover');
                item.style.backgroundColor = 'black';
            } else if (obtype === 'partial') {
                item.classList.add('partial-cover');
                item.style.backgroundColor = 'darkgray';
            }
        } else if (type === 'spawn-point') {
            item.classList.add('spawn-point');
            item.style.backgroundColor = 'green';
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
            health: item.getAttribute('data-health')
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

export { toggleMapBuilderItem, exportMap, importMap };