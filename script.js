const gridContainer = document.querySelector('.grid-container');
let GRID_LENGTH = 10;
let GRID_WIDTH = 10;
let mapBuilderMode = false;
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
const unitMovementPoints = 3;
let unitCounter = 0;

const skills = {
    heal: { cooldown: 3, effect: healUnit },
    overwatch: { cooldown: 5, effect: overwatch },
    aoeAttack: { cooldown: 4, effect: aoeAttack }
};
const skillCooldowns = {
    heal: 0,
    overwatch: 0,
    aoeAttack: 0
};

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
                item.style.backgroundColor = 'blue';
                item.setAttribute('data-health', cellData.health);
                addHealthBar(item, cellData.health);
                totalUnits++;
            } else if (cellData.enemy) {
                item.classList.add('enemy');
                item.style.backgroundColor = 'red';
                item.setAttribute('data-health', cellData.health);
                addHealthBar(item, cellData.health);
            } else if (cellData.obstacle) {
                item.classList.add('obstacle');
                item.style.backgroundColor = 'black';
            } else if (cellData.spawnPoint) {
                item.classList.add('spawn-point');
                item.style.backgroundColor = 'green';
                spawnPoints.push(item);
            }
        });
        updateUnitsLeftDisplay();
    }
}

generateGrid(GRID_LENGTH, GRID_WIDTH);

function resizeGrid() {
    const length = parseInt(document.getElementById('grid-length').value);
    const width = parseInt(document.getElementById('grid-width').value);
    GRID_LENGTH = length;
    GRID_WIDTH = width;
    generateGrid(GRID_LENGTH, GRID_WIDTH);
    resetGrid();
}

function addObstacles(amount = 10) {
    const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point)');
    for (let i = 0; i < amount; i++) {
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const isFullCover = Math.random() < 0.5;
            if (isFullCover) {
                randomCell.classList.add('full-cover', 'obstacle');
                randomCell.style.backgroundColor = 'black';
                console.log('Full cover added at', randomCell);
            } else {
                randomCell.classList.add('partial-cover', 'obstacle');
                randomCell.style.backgroundColor = 'darkgray';
                console.log('Partial cover added at', randomCell);
            }
        }
    }
}

function addSpawnPoints() {
    const row = Math.floor(Math.random() * 10);
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

function switchToMapBuilder() {
    mapBuilderMode = !mapBuilderMode;
    const button = document.getElementById('map-builder-button');
    const mapBuilderControls = document.getElementById('map-builder-controls');
    button.textContent = mapBuilderMode ? 'Switch to Game Mode' : 'Map Builder Mode';
    mapBuilderControls.style.display = mapBuilderMode ? 'block' : 'none';
    console.log(mapBuilderMode ? 'Switched to Map Builder Mode' : 'Switched to Game Mode');
}

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => handleGridItemClick(item));
    item.addEventListener('mouseover', () => handleGridItemMouseOver(item));
    item.addEventListener('mouseout', () => handleGridItemMouseOut(item));
});

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

        const healthBar = unit.querySelector('.health-bar');
        if (healthBar) {
            unit.removeChild(healthBar);
            target.appendChild(healthBar);
        } else {
            addHealthBar(target, unit.getAttribute('data-health'));
        }

        const unitIdLabel = unit.querySelector('.unit-id');
        if (unitIdLabel) {
            unit.removeChild(unitIdLabel);
            target.appendChild(unitIdLabel);
        }

        console.log('Unit moved from', unit, 'to', target);
        clearHighlights();
        movedUnits.add(target);
        unitsMoved++;
        updateUnitsLeftDisplay();
        updateUnitsLeftList();
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

function addUnitToSpawnPoint(spawnPoint) {
    spawnPoint.classList.add('unit');
    spawnPoint.style.backgroundColor = 'blue';
    spawnPoint.setAttribute('data-health', unitHealth);
    spawnPoint.setAttribute('data-mp', unitMovementPoints);
    spawnPoint.setAttribute('data-id', unitCounter);
    const unitIdLabel = document.createElement('div');
    unitIdLabel.classList.add('unit-id');
    unitIdLabel.textContent = unitCounter;
    spawnPoint.appendChild(unitIdLabel);
    addHealthBar(spawnPoint, unitHealth);
    console.log('Unit added at', spawnPoint);
    totalUnits++;
    unitCounter++;
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    spawnPoint.classList.remove('spawn-point');
    spawnPoints = spawnPoints.filter(point => point !== spawnPoint);
}

function resetGrid() {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove('unit', 'enemy', 'obstacle', 'spawn-point');
        item.style.backgroundColor = 'lightgray';
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
    movedUnits.clear();
    replenishMovementPoints();
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    console.log('Turn', turn);
    moveEnemies();
    updateSkillCooldowns();
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

// Skill system functions
function useSkill(skillName) {
    if (skillCooldowns[skillName] > 0) {
        console.log(`${skillName} is on cooldown for ${skillCooldowns[skillName]} more turns.`);
        return;
    }
    const skill = skills[skillName];
    if (selectedUnit && skill) {
        skill.effect(selectedUnit);
        skillCooldowns[skillName] = skill.cooldown;
        console.log(`${skillName} used by unit ${selectedUnit.getAttribute('data-id')}`);
    } else {
        console.log('No unit selected or invalid skill.');
    }
}

function healUnit(unit) {
    let health = parseInt(unit.getAttribute('data-health'));
    health = Math.min(health + 20, 100); // Heal 20 health points, max 100
    unit.setAttribute('data-health', health);
    updateHealthBar(unit, health);
    console.log('Unit healed:', unit);
}

function overwatch(unit) {
    unit.classList.add('overwatch');
    console.log('Unit set to overwatch:', unit);
}

function aoeAttack(unit) {
    const unitIndex = getCellIndex(unit);
    const unitRow = Math.floor(unitIndex / 10);
    const unitCol = unitIndex % 10;

    for (let row = unitRow - 1; row <= unitRow + 1; row++) {
        for (let col = unitCol - 1; col <= unitCol + 1; col++) {
            if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
                if (cell.classList.contains('enemy')) {
                    let enemyHealth = parseInt(cell.getAttribute('data-health'));
                    enemyHealth -= 15; // AOE attack deals 15 damage
                    if (enemyHealth <= 0) {
                        cell.classList.remove('enemy');
                        cell.style.backgroundColor = 'lightgray';
                        removeHealthBar(cell);
                        console.log('Enemy defeated by AOE attack at', cell);
                    } else {
                        cell.setAttribute('data-health', enemyHealth);
                        updateHealthBar(cell, enemyHealth);
                        console.log('Enemy hit by AOE attack at', cell, 'remaining health:', enemyHealth);
                    }
                }
            }
        }
    }
}

function updateSkillCooldowns() {
    for (const skill in skillCooldowns) {
        if (skillCooldowns[skill] > 0) {
            skillCooldowns[skill]--;
        }
    }
}

addEnemy(1);
