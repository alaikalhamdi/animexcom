function handleGridItemClick(item) {
    if (mapBuilderMode) {
        toggleMapBuilderItem(item);
    } else {
        console.log('Grid item clicked:', item);
        try {
            if (selectedUnit) {
                if (selectedUnit === item) {
                    cancelUnitSelection();
                } else if (item.classList.contains('unit')) {
                    cancelUnitSelection();
                    selectUnit(item);
                } else if (item.classList.contains('enemy') && item.classList.contains('attack-range')) {
                    attackEnemy(selectedUnit, item);
                } else {
                    moveUnit(selectedUnit, item);
                }
                selectedUnit = null;
            } else if (item.classList.contains('spawn-point') && !item.classList.contains('unit')) {
                addUnitToSpawnPoint(item);
            } else {
                selectUnit(item);
            }
        } catch (error) {
            console.error('Error moving unit:', error);
        }
    }
}

function handleGridItemMouseOver(item) {
    if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle') && !item.classList.contains('spawn-point')) {
        item.style.backgroundColor = 'lightblue';
    }
}

function handleGridItemMouseOut(item) {
    if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle') && !item.classList.contains('spawn-point')) {
        item.style.backgroundColor = 'lightgray';
    }
}

function addHealthBar(cell, health) {
    const healthBar = document.createElement('div');
    healthBar.classList.add('health-bar');
    healthBar.style.width = `${health}%`;
    cell.appendChild(healthBar);
}

function updateHealthBar(cell, health) {
    const healthBar = cell.querySelector('.health-bar');
    if (healthBar) {
        healthBar.style.width = `${health}%`;
    }
}

function removeHealthBar(cell) {
    const healthBar = cell.querySelector('.health-bar');
    if (healthBar) {
        cell.removeChild(healthBar);
    }
}

function removeUnitId(cell) {
    const unitIdLabel = cell.querySelector('.unit-id');
    if (unitIdLabel) {
        cell.removeChild(unitIdLabel);
    }
}

function updateTurnDisplay() {
    document.getElementById('turn-counter').textContent = turn;
}

function updateUnitsLeftDisplay() {
    const unitsLeft = totalUnits - unitsMoved;
    document.getElementById('units-left-counter').textContent = unitsLeft;
}

function updateUnitsLeftList() {
    const unitsLeftList = document.getElementById('units-left-list');
    const unitsLeft = Array.from(document.querySelectorAll('.grid-item.unit'))
        .filter(unit => !movedUnits.has(unit))
        .map(unit => unit.getAttribute('data-id'))
        .join(', ');
    unitsLeftList.textContent = unitsLeft;
}

function checkVictoryCondition() {
    const enemies = document.querySelectorAll('.grid-item.enemy');
    if (enemies.length === 0) {
        alert('Victory! All enemies are defeated.');
        resetGrid();
    }
}

function checkDefeatCondition() {
    const units = document.querySelectorAll('.grid-item.unit');
    if (units.length === 0) {
        alert('Defeat! All your units are defeated.');
        resetGrid();
    }
}

function highlightMoves(unit) {
    clearHighlights();
    const unitIndex = getCellIndex(unit);
    const unitRow = Math.floor(unitIndex / 10);
    const unitCol = unitIndex % 10;
    const unitMP = parseInt(unit.getAttribute('data-mp'));

    for (let row = unitRow - unitMP; row <= unitRow + unitMP; row++) {
        for (let col = unitCol - unitMP; col <= unitCol + unitMP; col++) {
            if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
                const path = findPath(unit, cell);
                if (path.length - 1 <= unitMP && !cell.classList.contains('unit') && !cell.classList.contains('enemy') && !cell.classList.contains('obstacle') && !cell.classList.contains('spawn-point')) {
                    cell.classList.add('highlight');
                }
            }
        }
    }
}

function highlightAttackRange(unit) {
    const unitIndex = getCellIndex(unit);
    const unitRow = Math.floor(unitIndex / 10);
    const unitCol = unitIndex % 10;

    for (let row = unitRow - attackRange; row <= unitRow + attackRange; row++) {
        for (let col = unitCol - attackRange; col <= unitCol + attackRange; col++) {
            if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                const distance = Math.abs(row - unitRow) + Math.abs(col - unitCol);
                if (distance <= attackRange) {
                    const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
                    if (cell.classList.contains('enemy')) {
                        cell.classList.add('attack-range');
                    }
                }
            }
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.grid-item.highlight').forEach(item => {
        item.classList.remove('highlight');
    });
    document.querySelectorAll('.grid-item.attack-range').forEach(item => {
        item.classList.remove('attack-range');
    });
}