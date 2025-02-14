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
    if (item.classList.contains('unit') || item.classList.contains('enemy') || item.classList.contains('obstacle') || item.classList.contains('spawn-point') || item.classList.contains('vault-start') || item.classList.contains('vault-end')) {
        closeModal();
        removeItem(item);
    } else {
        selectedItem = item;
        openModal(item);
    }
}

function removeItem(item) {
    if (item.classList.contains('unit')) {
        unitCounter--;
        totalUnits--;
        updateUnitsLeftDisplay();
        updateUnitsLeftList();
    }
    item.classList.remove('unit', 'enemy', 'obstacle', 'full-cover', 'partial-cover', 'spawn-point', 'vault-start', 'vault-end');
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    removeHealthBar(item);
    removeUnitId(item);
    removeVaultVisualCue(item);
    item.removeAttribute('data-health');
    item.removeAttribute('data-id');
    item.removeAttribute('data-mp');
    item.removeAttribute('data-vault-direction');
    while (item.firstChild) {
        item.removeChild(item.firstChild);
    }
    item.style.removeProperty('border');
}

function selectItemType(type, direction, obstacleType) {
    if (type === 'unit') {
        selectedItem.classList.add('unit');
        selectedItem.setAttribute('data-health', unitHealth);
        selectedItem.setAttribute('data-mp', unitMovementPoints);
        selectedItem.setAttribute('data-id', unitCounter);
        addHealthBar(selectedItem, unitHealth);
        const unitIdLabel = document.createElement('div');
        unitIdLabel.classList.add('unit-id');
        unitIdLabel.textContent = unitCounter;
        selectedItem.appendChild(unitIdLabel);
        totalUnits++;
        unitCounter++;
        updateUnitsLeftDisplay();
        updateUnitsLeftList();
    } else if (type === 'enemy') {
        selectedItem.classList.add('enemy');
        selectedItem.setAttribute('data-health', enemyHealth);
        addHealthBar(selectedItem, enemyHealth);
    } else if (type === 'obstacle') {
        if (!obstacleType) return;
        if (obstacleType === 'full') {
            selectedItem.classList.add('obstacle', 'full-cover');
        } else if (obstacleType === 'partial') {
            selectedItem.classList.add('obstacle', 'partial-cover');
        }
    } else if (type === 'spawn-point') {
        selectedItem.classList.add('spawn-point');
        spawnPoints.push(selectedItem);
    } else if (type === 'vault') {
        if (!direction) return;
        if (!direction.match(/horizontal|vertical/)) console.error('Invalid vault direction:', direction);
        addVault(selectedItem, direction);
    }
    closeModal();
}

function openModal(item) {
    const modal = document.getElementById('map-builder-modal');
    const rect = item.getBoundingClientRect();
    modal.style.display = 'flex';
    modal.style.top = `${rect.top + window.scrollY}px`;
    modal.style.left = `${rect.right + window.scrollX}px`;
}

function closeModal() {
    document.getElementById('map-builder-modal').style.display = 'none';
}

function itemTypeSelectorOnChange() {
    const type = document.getElementById('item-type-selector').value;
    const direction = document.getElementById('vault-direction-selector');
    const obstacleType = document.getElementById('obstacle-type-selector');
    obstacleType.style.display = (type === 'obstacle') ? 'block' : 'none';
    direction.style.display = (type === 'vault') ? 'block' : 'none';
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