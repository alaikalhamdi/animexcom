let selectedItem = null;

function switchToMapBuilder() {
    mapBuilderMode = !mapBuilderMode;
    const button = document.getElementById('map-builder-button');
    const mapBuilderControls = document.getElementById('map-builder-controls');
    button.textContent = mapBuilderMode ? 'Switch to Game Mode' : 'Map Builder Mode';
    mapBuilderControls.style.display = mapBuilderMode ? 'block' : 'none';
    console.log(mapBuilderMode ? 'Switched to Map Builder Mode' : 'Switched to Game Mode');
}

function toggleMapBuilderItem(item) {
    selectedItem = item;
    openModal();
}

function selectItemType(type) {
    if (type === 'unit') {
        selectedItem.classList.add('unit');
        selectedItem.setAttribute('data-health', unitHealth);
        addHealthBar(selectedItem, unitHealth);
        totalUnits++;
        updateUnitsLeftDisplay();
    } else if (type === 'enemy') {
        selectedItem.classList.add('enemy');
        selectedItem.setAttribute('data-health', enemyHealth);
        addHealthBar(selectedItem, enemyHealth);
    } else if (type === 'obstacle') {
        const coverType = prompt('Enter cover type (full/partial):');
        if (coverType === 'full') {
            selectedItem.classList.add('obstacle', 'full-cover');
        } else if (coverType === 'partial') {
            selectedItem.classList.add('obstacle', 'partial-cover');
        }
    } else if (type === 'spawn-point') {
        selectedItem.classList.add('spawn-point');
        spawnPoints.push(selectedItem);
    } else if (type === 'vault') {
        const direction = prompt('Enter vault direction (horizontal/vertical):');
        if (!direction) return;
        if (!direction.match(/horizontal|vertical/)) console.error('Invalid vault direction:', direction);
        addVault(selectedItem, direction);
    }
    closeModal();
}

function openModal() {
    document.getElementById('map-builder-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('map-builder-modal').style.display = 'none';
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
            coverType: item.classList.contains('full-cover') ? 'full' : item.classList.contains('partial-cover') ? 'partial' : null,
            vaultStart: item.classList.contains('vault-start'),
            vaultEnd: item.classList.contains('vault-end'),
            vaultDirection: item.getAttribute('data-vault-direction')
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