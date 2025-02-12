let lastClickedTile = null;
let isConfirming = false;

function handleGridItemClick(item) {
    console.log('Grid item clicked:', item);
    if (mapBuilderMode) {
        console.log('Map builder mode active');
        toggleMapBuilderItem(item);
    } else {
        try {
            if (selectedUnit) {
                console.log('Selected unit:', selectedUnit);
                if (selectedUnit === item) {
                    console.log('Cancelling unit selection');
                    cancelUnitSelection();
                    selectedUnit = null;
                } else if (item.classList.contains('unit')) {
                    console.log('Selecting new unit');
                    cancelUnitSelection();
                    selectUnit(item);
                } else if (item.classList.contains('enemy') && item.classList.contains('attack-range')) {
                    const confirmMoveGrid = document.querySelector('.grid-item.confirm-move');
                    console.log('Attacking enemy');
                    attackEnemy(selectedUnit, item);
                    if (confirmMoveGrid) {
                        moveUnit(selectedUnit, confirmMoveGrid);
                    } else {
                        nextTurn();
                    }
                    selectedUnit = null;
                } else if (item.classList.contains('highlight')) {
                    if (item.classList.contains('confirm-move')) {
                        console.log('Moving unit to confirmed position');
                        moveUnit(selectedUnit, item);
                        item.classList.remove('confirm-move');
                        selectedUnit = null;
                    } else {
                        console.log('Highlighting move confirmation');
                        clearHighlights('confirm-move');
                        item.classList.add('confirm-move');
                        clearHighlights('attack-range');
                        highlightAttackRange(item);
                    }
                } else {
                    console.log('Cancelling unit selection');
                    clearHighlights();
                    cancelUnitSelection();
                    selectedUnit = null;
                }
            } else if (item.classList.contains('spawn-point') && !item.classList.contains('unit')) {
                console.log('Adding unit to spawn point');
                addUnitToSpawnPoint(item);
            } else {
                console.log('Selecting unit');
                selectUnit(item);
            }
        } catch (error) {
            console.error('Error handling grid item click:', error);
        }
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
                    if (!cell.classList.contains('unit') && !cell.classList.contains('obstacle') && !cell.classList.contains('spawn-point') && !cell.classList.contains('confirm-move')) {
                        cell.classList.add('attack-range');
                    }
                }
            }
        }
    }
}

function clearHighlights(type) {
    if (!type || type === 'highlight') {
        document.querySelectorAll('.grid-item.highlight').forEach(item => {
            item.classList.remove('highlight');
        });
    }
    if (!type || type === 'confirm-move') {
        document.querySelectorAll('.grid-item.confirm-move').forEach(item => {
            item.classList.remove('confirm-move');
        });
    }
    if (!type || type === 'attack-range') {
        document.querySelectorAll('.grid-item.attack-range').forEach(item => {
            item.classList.remove('attack-range');
        });
    }
}

function createVaultVisualCue(cell, direction, mirrored = false) {
    const visualCue = document.createElement('div');
    visualCue.classList.add('vault-cue');
    if (direction === 'horizontal') {
        visualCue.style.cssText = 'width: 10px; height: 100%;';
        if (mirrored) {
            visualCue.style.left = '0';
            visualCue.style.right = 'auto';
            cell.style.borderLeft = '1px solid black';
        } else {
            visualCue.style.right = '0';
            visualCue.style.left = 'auto';
            cell.style.borderRight = '1px solid black';
        }
    } else {
        visualCue.style.cssText = 'width: 100%; height: 8px;';
        if (mirrored) {
            visualCue.style.top = '0';
            visualCue.style.bottom = 'auto';
            cell.style.borderTop = '1px solid black';
        } else {
            visualCue.style.bottom = '0';
            visualCue.style.top = 'auto';
            cell.style.borderBottom = '1px solid black';
        }
    }
    cell.appendChild(visualCue);
}

function removeVaultVisualCue(cell) {
    const visualCue = cell.querySelector('.vault-cue');
    if (visualCue) {
        cell.removeChild(visualCue);
    }
    cell.style.borderRight = '';
    cell.style.borderLeft = '';
    cell.style.borderBottom = '';
    cell.style.borderTop = '';
}