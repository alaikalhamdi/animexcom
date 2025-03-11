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
            } else if (cellData.vaultStart) {
                item.classList.add('vault-start');
                item.setAttribute('data-vault-direction', cellData.vaultDirection);
                createVaultVisualCue(item, cellData.vaultDirection);
            } else if (cellData.vaultEnd) {
                item.classList.add('vault-end');
                item.setAttribute('data-vault-direction', cellData.vaultDirection);
                createVaultVisualCue(item, cellData.vaultDirection, true);
            }
        });
        updateUnitsLeftDisplay();
    }
}

function addObstacles(amount = 8) {
    const emptyCells = document.querySelectorAll(
        '.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point):not(.vault-start):not(.vault-end):not(.empty)'
    );
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

function addVaults(amount = 2) {
    const emptyCells = Array.from(document.querySelectorAll(
        '.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point):not(.vault-start):not(.vault-end):not(.empty)'
    ));

    for (let i = 0; i < amount; i++) {
        if (emptyCells.length === 0) break;

        const randomCell = emptyCells.splice(Math.floor(Math.random() * emptyCells.length), 1)[0];
        const gridItems = Array.from(randomCell.parentNode.children);
        const index = gridItems.indexOf(randomCell);

        const isRightEdge = (index + 1) % GRID_WIDTH === 0;
        const isBottomEdge = index >= GRID_WIDTH * (GRID_LENGTH - 1);

        let adjacentCell = null;
        let direction = '';

        if (!isRightEdge && emptyCells.includes(gridItems[index + 1])) {
            adjacentCell = gridItems[index + 1];
            direction = 'horizontal';
        } else if (!isBottomEdge && emptyCells.includes(gridItems[index + GRID_WIDTH])) {
            adjacentCell = gridItems[index + GRID_WIDTH];
            direction = 'vertical';
        }

        if (adjacentCell) {
            randomCell.classList.add('vault-start');
            randomCell.setAttribute('data-vault-direction', direction);
            adjacentCell.classList.add('vault-end');
            adjacentCell.setAttribute('data-vault-direction', direction);

            createVaultVisualCue(randomCell, direction);
            createVaultVisualCue(adjacentCell, direction, true);

            console.log('Vault added at', randomCell, 'and', adjacentCell);
        }
    }
}

function addVault(startCell, direction) {
    const gridItems = Array.from(gridContainer.children);
    const startIndex = gridItems.indexOf(startCell);
    let endCell = null;

    if (direction === 'horizontal' && (startIndex + 1) % GRID_WIDTH !== 0) {
        endCell = gridItems[startIndex + 1];
    } else if (direction === 'vertical' && startIndex + GRID_WIDTH < gridItems.length) {
        endCell = gridItems[startIndex + GRID_WIDTH];
    }

    if (startCell && endCell) {
        startCell.classList.add('vault-start');
        startCell.setAttribute('data-vault-direction', direction);
        endCell.classList.add('vault-end');
        endCell.setAttribute('data-vault-direction', direction);

        createVaultVisualCue(startCell, direction);
        createVaultVisualCue(endCell, direction, true);

        console.log('Vault added at', startCell, 'and', endCell);
    } else {
        console.error('Invalid vault placement');
        alert('Invalid vault placement');
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
    resetZoom();
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove(
            'unit', 'enemy', 'selected', 'spawn-point', 
            'obstacle', 'partial-cover', 'full-cover', 
            'vault-start', 'vault-end', 
            'empty'
        );
        removeHealthBar(item);
        removeUnitId(item);
        removeVaultVisualCue(item);
    });
    resetSkillCooldowns();
    turn = 0;
    totalUnits = 0;
    unitsMoved = 0;
    unitCounter = 0;
    selectedUnit = null;
    movedUnits.clear();
    spawnPoints = [];
    cancelUnitSelection();
    toggleButtons(false);
    clearAttackLine();
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    clearHighlights();
    console.log('Grid reset');
    if (!mapBuilderMode) {
        addObstacles();
        addSpawnPoints();
        addEnemy(1);
        addVaults();
    }
}