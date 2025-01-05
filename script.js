const gridContainer = document.querySelector('.grid-container');
const GRID_SIZE = 100;
const moveLimit = 3;
const attackRange = 2;
const unitHealth = 50;
const enemyHealth = 50;
const attackDamage = 20;
let unitsMoved = 0;
let totalUnits = 0;
let selectedUnit = null;
let turn = 0;
let movedUnits = new Set();
let spawnPoints = [];
// Add movement points
const unitMovementPoints = 3;

// Generate grid items
for (let i = 0; i < GRID_SIZE; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridContainer.appendChild(gridItem);
}

// Add obstacles
function addObstacles(amount = 10) {
    const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point)');
    for (let i = 0; i < amount; i++) {
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const isFullCover = Math.random() < 0.5; // 50% chance for full cover
            if (isFullCover) {
                randomCell.classList.add('full-cover');
                randomCell.classList.add('obstacle');
                randomCell.style.backgroundColor = 'black';
                console.log('Full cover added at', randomCell);
            } else {
                randomCell.classList.add('partial-cover');
                randomCell.classList.add('obstacle');
                randomCell.style.backgroundColor = 'darkgray';
                console.log('Partial cover added at', randomCell);
            }
        }
    }
}

// Add spawn points
function addSpawnPoints() {
    const row = Math.floor(Math.random() * 10); // Random row
    for (let col = 0; col < 3; col++) {
        const index = row * 10 + col;
        const spawnPoint = document.querySelector(`.grid-container > div:nth-child(${index + 1})`);
        spawnPoint.classList.add('spawn-point');
        spawnPoint.style.backgroundColor = 'green';
        spawnPoints.push(spawnPoint);
        console.log('Spawn point added at', spawnPoint);
    }
}

addObstacles();
addSpawnPoints();

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
        if (mapBuilderMode) {
            toggleMapBuilderItem(item);
        } else {
            console.log('Grid item clicked:', item);
            try {
                if (selectedUnit) {
                    if (selectedUnit === item) {
                        // Cancel movement if the same unit is clicked again
                        cancelUnitSelection();
                    } else if (item.classList.contains('unit')) {
                        // Select another unit
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
    });

    item.addEventListener('mouseover', () => {
        if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle') && !item.classList.contains('spawn-point')) {
            item.style.backgroundColor = 'lightblue';
        }
    });

    item.addEventListener('mouseout', () => {
        if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle') && !item.classList.contains('spawn-point')) {
            item.style.backgroundColor = 'lightgray';
        }
    });
});

function handleGridItemClick(item) {
    if (mapBuilderMode) {
        toggleMapBuilderItem(item);
    } else {
        console.log('Grid item clicked:', item);
        try {
            if (selectedUnit) {
                if (item.classList.contains('enemy') && item.classList.contains('attack-range')) {
                    attackEnemy(selectedUnit, item);
                } else {
                    moveUnit(selectedUnit, item);
                }
                selectedUnit = null;
            } else {
                selectUnit(item);
            }
        } catch (error) {
            console.error('Error moving unit:', error);
        }
    }
}

function handleGridItemMouseOver(item) {
    if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle')) {
        item.style.backgroundColor = 'lightblue';
    }
}

function handleGridItemMouseOut(item) {
    if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle')) {
        item.style.backgroundColor = 'lightgray';
    }
}

function cancelUnitSelection() {
    if (selectedUnit) {
        selectedUnit.style.backgroundColor = 'blue';
        clearHighlights();
        selectedUnit = null;
        console.log('Unit selection canceled');
    }
}

function selectUnit(item) {
    if (item.classList.contains('unit')) {
        selectedUnit = item;
        item.style.backgroundColor = 'yellow';
        console.log('Unit selected:', item);
        highlightMoves(item);
        highlightAttackRange(item);
    }
}

function moveUnit(unit, target) {
    const path = findPath(unit, target);
    const unitMP = parseInt(unit.getAttribute('data-mp'));
    if (path.length - 1 <= unitMP && !target.classList.contains('unit') && !target.classList.contains('obstacle') && target.classList.contains('highlight')) {
        target.classList.add('unit');
        target.style.backgroundColor = 'blue';
        unit.classList.remove('unit');
        unit.style.backgroundColor = 'lightgray';
        target.setAttribute('data-health', unit.getAttribute('data-health'));
        target.setAttribute('data-mp', unitMP - (path.length - 1));

        // Move health bar
        const healthBar = unit.querySelector('.health-bar');
        if (healthBar) {
            unit.removeChild(healthBar);
            target.appendChild(healthBar);
        } else {
            addHealthBar(target, unit.getAttribute('data-health'));
        }

        console.log('Unit moved from', unit, 'to', target);
        clearHighlights();
        movedUnits.add(target);
        unitsMoved++;
        updateUnitsLeftDisplay();
        if (unitsMoved >= totalUnits) {
            nextTurn();
        }
    } else {
        throw new Error('Invalid move');
    }
}

function attackEnemy(unit, enemy) {
    let enemyHealth = parseInt(enemy.getAttribute('data-health'));
    const coverBonus = calculateCoverBonus(unit, enemy);
    enemyHealth -= (attackDamage - coverBonus);
    if (enemyHealth <= 0) {
        enemy.classList.remove('enemy');
        enemy.style.backgroundColor = 'lightgray';
        console.log('Enemy defeated by', unit, 'at', enemy);
        removeHealthBar(enemy);
        checkVictoryCondition();
    } else {
        enemy.setAttribute('data-health', enemyHealth);
        updateHealthBar(enemy, enemyHealth);
        console.log('Enemy attacked by', unit, 'at', enemy, 'remaining health:', enemyHealth);
    }
    clearHighlights();
}

function addUnit() {
    const emptySpawnPoints = spawnPoints.filter(point => !point.classList.contains('unit'));
    if (emptySpawnPoints.length > 0) {
        const randomCell = emptySpawnPoints[Math.floor(Math.random() * emptySpawnPoints.length)];
        randomCell.classList.add('unit');
        randomCell.style.backgroundColor = 'blue';
        randomCell.setAttribute('data-health', unitHealth);
        addHealthBar(randomCell, unitHealth);
        console.log('Unit added at', randomCell);
        totalUnits++;
        updateUnitsLeftDisplay();
        // Remove the spawn point after use
        randomCell.classList.remove('spawn-point');
        randomCell.style.backgroundColor = 'lightgray';
        spawnPoints = spawnPoints.filter(point => point !== randomCell);
    } else {
        console.log('No empty spawn points available');
    }
}

function addUnitToSpawnPoint(spawnPoint) {
    spawnPoint.classList.add('unit');
    spawnPoint.style.backgroundColor = 'blue';
    spawnPoint.setAttribute('data-health', unitHealth);
    spawnPoint.setAttribute('data-mp', unitMovementPoints);
    addHealthBar(spawnPoint, unitHealth);
    console.log('Unit added at', spawnPoint);
    totalUnits++;
    updateUnitsLeftDisplay();
    // Remove the spawn point after use
    spawnPoint.classList.remove('spawn-point');
    spawnPoints = spawnPoints.filter(point => point !== spawnPoint);
}

function removeUnit() {
    const units = document.querySelectorAll('.grid-item.unit');
    if (units.length > 0) {
        const randomUnit = units[Math.floor(Math.random() * units.length)];
        randomUnit.classList.remove('unit');
        randomUnit.style.backgroundColor = 'lightgray';
        removeHealthBar(randomUnit);
        console.log('Unit removed from', randomUnit);
    }
}

function resetGrid() {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove('unit');
        item.classList.remove('enemy');
        item.classList.remove('obstacle');
        item.classList.remove('spawn-point');
        item.style.backgroundColor = 'lightgray';
        removeHealthBar(item);
    });
    turn = 0;
    totalUnits = 0;
    unitsMoved = 0;
    selectedUnit = null; // Reset selected unit
    movedUnits.clear(); // Clear moved units
    spawnPoints = []; // Clear spawn points
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    clearHighlights();
    console.log('Grid reset');
    if (!mapBuilderMode) {
        addObstacles(); // Regenerate obstacles
        addSpawnPoints(); // Regenerate spawn points
        addEnemy(1); // Add an enemy after resetting the grid
    }
}

function moveEnemies() {
    const units = document.querySelectorAll('.grid-item.unit');
    const enemies = document.querySelectorAll('.grid-item.enemy');

    enemies.forEach(enemy => {
        let closestUnit = null;
        let closestDistance = Infinity;

        units.forEach(unit => {
            const distance = Math.abs(getCellIndex(enemy) % 10 - getCellIndex(unit) % 10) + Math.abs(Math.floor(getCellIndex(enemy) / 10) - Math.floor(getCellIndex(unit) / 10));
            if (distance < closestDistance) {
                closestDistance = distance;
                closestUnit = unit;
            }
        });

        if (closestUnit) {
            const enemyIndex = getCellIndex(enemy);
            const unitIndex = getCellIndex(closestUnit);
            const enemyRow = Math.floor(enemyIndex / 10);
            const enemyCol = enemyIndex % 10;
            const unitRow = Math.floor(unitIndex / 10);
            const unitCol = unitIndex % 10;

            let newRow = enemyRow;
            let newCol = enemyCol;

            if (enemyRow < unitRow) newRow++;
            else if (enemyRow > unitRow) newRow--;

            if (enemyCol < unitCol) newCol++;
            else if (enemyCol > unitCol) newCol--;

            const newCell = document.querySelector(`.grid-container > div:nth-child(${newRow * 10 + newCol + 1})`);
            if (newCell.classList.contains('unit')) {
                attackUnit(enemy, newCell);
            } else if (!newCell.classList.contains('enemy') && !newCell.classList.contains('obstacle')) {
                newCell.classList.add('enemy');
                newCell.style.backgroundColor = 'red';
                newCell.setAttribute('data-health', enemy.getAttribute('data-health'));
                addHealthBar(newCell, enemy.getAttribute('data-health'));
                enemy.classList.remove('enemy');
                enemy.style.backgroundColor = 'lightgray';
                removeHealthBar(enemy);
                console.log('Enemy moved from', enemy, 'to', newCell);
            }
        }
    });
}

function attackUnit(enemy, unit) {
    let unitHealth = parseInt(unit.getAttribute('data-health'));
    const coverBonus = calculateCoverBonus(enemy, unit);
    unitHealth -= (attackDamage - coverBonus);
    if (unitHealth <= 0) {
        unit.classList.remove('unit');
        unit.style.backgroundColor = 'lightgray';
        console.log('Unit defeated by', enemy, 'at', unit);
        removeHealthBar(unit);
        totalUnits--;
        updateUnitsLeftDisplay();
        checkDefeatCondition();
    } else {
        unit.setAttribute('data-health', unitHealth);
        updateHealthBar(unit, unitHealth);
        console.log('Unit attacked by', enemy, 'at', unit, 'remaining health:', unitHealth);
    }
}

function addEnemy(amount = 1) {
    for (let i = 0; i < amount; i++) {
        const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy)');
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.classList.add('enemy');
            randomCell.style.backgroundColor = 'red';
            randomCell.setAttribute('data-health', enemyHealth);
            addHealthBar(randomCell, enemyHealth);
            console.log('Enemy added at', randomCell);
        }
    }
}

function nextTurn() {
    turn++;
    unitsMoved = 0;
    movedUnits.clear(); // Clear moved units for the new turn
    replenishMovementPoints(); // Replenish movement points for all units
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    console.log('Turn', turn);
    moveEnemies();
}

function replenishMovementPoints() {
    document.querySelectorAll('.grid-item.unit').forEach(unit => {
        unit.setAttribute('data-mp', unitMovementPoints);
    });
}

function getCellIndex(cell) {
    return Array.from(cell.parentNode.children).indexOf(cell);
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
                if (path.length - 1 <= unitMP && !cell.classList.contains('unit') && !cell.classList.contains('enemy') && !cell.classList.contains('obstacle')) {
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

function updateTurnDisplay() {
    document.getElementById('turn-counter').textContent = turn;
}

function updateUnitsLeftDisplay() {
    const unitsLeft = totalUnits - unitsMoved;
    document.getElementById('units-left-counter').textContent = unitsLeft;
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

function calculateDistance(cell1, cell2) {
    const index1 = getCellIndex(cell1);
    const index2 = getCellIndex(cell2);
    const row1 = Math.floor(index1 / 10);
    const col1 = index1 % 10;
    const row2 = Math.floor(index2 / 10);
    const col2 = index2 % 10;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

function findPath(start, end) {
    const startIdx = getCellIndex(start);
    const endIdx = getCellIndex(end);
    const startRow = Math.floor(startIdx / 10);
    const startCol = startIdx % 10;
    const endRow = Math.floor(endIdx / 10);
    const endCol = endIdx % 10;

    const queue = [[startRow, startCol]];
    const visited = new Set();
    const cameFrom = {};
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
        const [currentRow, currentCol] = queue.shift();
        if (currentRow === endRow && currentCol === endCol) {
            const path = [];
            let current = `${endRow},${endCol}`;
            while (current) {
                const [row, col] = current.split(',').map(Number);
                path.unshift(document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`));
                current = cameFrom[current];
            }
            return path;
        }

        const neighbors = [
            [currentRow - 1, currentCol],
            [currentRow + 1, currentCol],
            [currentRow, currentCol - 1],
            [currentRow, currentCol + 1]
        ];

        for (const [neighborRow, neighborCol] of neighbors) {
            if (neighborRow >= 0 && neighborRow < 10 && neighborCol >= 0 && neighborCol < 10) {
                const neighbor = `${neighborRow},${neighborCol}`;
                const neighborCell = document.querySelector(`.grid-container > div:nth-child(${neighborRow * 10 + neighborCol + 1})`);
                if (!visited.has(neighbor) && !neighborCell.classList.contains('obstacle')) {
                    queue.push([neighborRow, neighborCol]);
                    visited.add(neighbor);
                    cameFrom[neighbor] = `${currentRow},${currentCol}`;
                }
            }
        }
    }

    return [];
}

function calculateCoverBonus(attacker, defender) {
    const defenderIndex = getCellIndex(defender);
    const defenderRow = Math.floor(defenderIndex / 10);
    const defenderCol = defenderIndex % 10;

    const adjacentCells = [
        document.querySelector(`.grid-container > div:nth-child(${defenderRow * 10 + defenderCol})`),
        document.querySelector(`.grid-container > div:nth-child(${defenderRow * 10 + defenderCol + 2})`),
        document.querySelector(`.grid-container > div:nth-child(${(defenderRow - 1) * 10 + defenderCol + 1})`),
        document.querySelector(`.grid-container > div:nth-child(${(defenderRow + 1) * 10 + defenderCol + 1})`)
    ];

    for (const cell of adjacentCells) {
        if (cell && cell.classList.contains('full-cover')) {
            return 10; // Full cover bonus
        } else if (cell && cell.classList.contains('partial-cover')) {
            return 5; // Partial cover bonus
        }
    }

    return 0; // No cover
}

addEnemy(1);
