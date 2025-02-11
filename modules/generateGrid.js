const gridContainer = document.querySelector('.grid-container');

let spawnPoints = [];

function generateGrid(length, width, mapData = null) {
    gridContainer.style.gridTemplateColumns = `repeat(${width}, 50px)`;
    gridContainer.style.gridTemplateRows = `repeat(${length}, 50px)`;
    gridContainer.innerHTML = '';
    for (let i = 0; i < length * width; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridContainer.appendChild(gridItem);
    }
    if (mapData) {
        mapData.forEach((cellData, index) => {
            const item = gridContainer.children[index];
            if (cellData.unit) {
                item.classList.add('unit');
                item.setAttribute('data-health', cellData.health);
                item.setAttribute('data-id', cellData.unitId);
                const unitIdLabel = document.createElement('div');
                unitIdLabel.classList.add('unit-id');
                unitIdLabel.textContent = cellData.unitId;
                item.appendChild(unitIdLabel);
                item.setAttribute('data-mp', cellData.mp);
                addHealthBar(item, cellData.health);
                totalUnits++;
            } else if (cellData.enemy) {
                item.classList.add('enemy');
                item.setAttribute('data-health', cellData.health);
                addHealthBar(item, cellData.health);
            } else if (cellData.obstacle) {
                item.classList.add('obstacle');
                if (cellData.coverType === 'full') {
                    item.classList.add('full-cover');
                } else if (cellData.coverType === 'partial') {
                    item.classList.add('partial-cover');
                }
            } else if (cellData.spawnPoint) {
                item.classList.add('spawn-point');
                spawnPoints.push(item);
            }
        });
        updateUnitsLeftDisplay();
    }
}

function addObstacles(amount = 10) {
    const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point)');
    for (let i = 0; i < amount; i++) {
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const isFullCover = Math.random() < 0.5;
            if (isFullCover) {
                randomCell.classList.add('full-cover', 'obstacle');
                console.log('Full cover added at', randomCell);
            } else {
                randomCell.classList.add('partial-cover', 'obstacle');
                console.log('Partial cover added at', randomCell);
            }
        }
    }
}

function addSpawnPoints() {
    let added = 0;
    while (added < 3) {
        const row = Math.floor(Math.random() * 10);
        for (let col = 0; col < 10; col++) {
            const index = row * 10 + col;
            const spawnPoint = document.querySelector(`.grid-container > div:nth-child(${index + 1})`);
            if (!spawnPoint.classList.contains('unit') && !spawnPoint.classList.contains('enemy') && !spawnPoint.classList.contains('obstacle')) {
                spawnPoint.classList.add('spawn-point');
                spawnPoints.push(spawnPoint);
                console.log('Spawn point added at', spawnPoint);
                added++;
                if (added >= 3) break;
            }
        }
    }
}

function resizeGrid() {
    const length = parseInt(document.getElementById('grid-length').value);
    const width = parseInt(document.getElementById('grid-width').value);
    GRID_LENGTH = length;
    GRID_WIDTH = width;
    generateGrid(GRID_LENGTH, GRID_WIDTH);
    resetGrid();
}

function resetGrid() {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove('unit', 'enemy', 'obstacle', 'partial-cover', 'full-cover', 'spawn-point', 'selected');
        removeHealthBar(item);
        removeUnitId(item);
    });
    turn = 0;
    totalUnits = 0;
    unitsMoved = 0;
    unitCounter = 0;
    selectedUnit = null;
    movedUnits.clear();
    spawnPoints = [];
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    clearHighlights();
    console.log('Grid reset');
    if (!mapBuilderMode) {
        addObstacles();
        addSpawnPoints();
        addEnemy(1);
    }
}