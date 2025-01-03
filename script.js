const gridContainer = document.querySelector('.grid-container');

// Generate 100 grid items
for (let i = 0; i < 100; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridContainer.appendChild(gridItem);
}

// Add obstacles
function addObstacles(amount = 10) {
    const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle)');
    for (let i = 0; i < amount; i++) {
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.classList.add('obstacle');
            randomCell.style.backgroundColor = 'black';
            console.log('Obstacle added at', randomCell);
        }
    }
}

addObstacles();

const moveLimit = 3;
const attackRange = 1;
const unitHealth = 50;
const enemyHealth = 50;
const attackDamage = 20;
let unitsMoved = 0;
let totalUnits = 0;
let selectedUnit = null;
let turn = 0;
let mapBuilderMode = false;

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
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
    });

    item.addEventListener('mouseover', () => {
        if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle')) {
            item.style.backgroundColor = 'lightblue';
        }
    });

    item.addEventListener('mouseout', () => {
        if (selectedUnit && !item.classList.contains('unit') && !item.classList.contains('enemy') && !item.classList.contains('obstacle')) {
            item.style.backgroundColor = 'lightgray';
        }
    });
});

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
    if (!target.classList.contains('unit') && !target.classList.contains('obstacle') && target.classList.contains('highlight')) {
        target.classList.add('unit');
        target.style.backgroundColor = 'blue';
        unit.classList.remove('unit');
        unit.style.backgroundColor = 'lightgray';
        target.setAttribute('data-health', unit.getAttribute('data-health'));

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
    enemyHealth -= attackDamage;
    if (enemyHealth <= 0) {
        enemy.classList.remove('enemy');
        enemy.style.backgroundColor = 'lightgray';
        console.log('Enemy defeated by', unit, 'at', enemy);
        removeHealthBar(enemy);
    } else {
        enemy.setAttribute('data-health', enemyHealth);
        updateHealthBar(enemy, enemyHealth);
        console.log('Enemy attacked by', unit, 'at', enemy, 'remaining health:', enemyHealth);
    }
    clearHighlights();
}

function addUnit() {
    const emptyCells = document.querySelectorAll('.grid-item:not(.unit)');
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.classList.add('unit');
        randomCell.style.backgroundColor = 'blue';
        randomCell.setAttribute('data-health', unitHealth);
        addHealthBar(randomCell, unitHealth);
        console.log('Unit added at', randomCell);
        totalUnits++;
        updateUnitsLeftDisplay();
    }
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
        item.style.backgroundColor = 'lightgray';
        removeHealthBar(item);
    });
    turn = 0;
    totalUnits = 0;
    unitsMoved = 0;
    selectedUnit = null; // Reset selected unit
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    clearHighlights();
    console.log('Grid reset');
    if (!mapBuilderMode) {
        addObstacles(); // Regenerate obstacles
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
    console.log('Unit health:', unitHealth);
    unitHealth -= attackDamage;
    if (unitHealth <= 0) {
        unit.classList.remove('unit');
        unit.style.backgroundColor = 'lightgray';
        console.log('Unit defeated by', enemy, 'at', unit);
        removeHealthBar(unit);
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
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    console.log('Turn', turn);
    moveEnemies();
}

function getCellIndex(cell) {
    return Array.from(cell.parentNode.children).indexOf(cell);
}

function highlightMoves(unit) {
    clearHighlights();
    const unitIndex = getCellIndex(unit);
    const unitRow = Math.floor(unitIndex / 10);
    const unitCol = unitIndex % 10;

    for (let row = unitRow - moveLimit; row <= unitRow + moveLimit; row++) {
        for (let col = unitCol - moveLimit; col <= unitCol + moveLimit; col++) {
            if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                const distance = Math.abs(row - unitRow) + Math.abs(col - unitCol);
                if (distance <= moveLimit) {
                    const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
                    if (!cell.classList.contains('unit') && !cell.classList.contains('enemy') && !cell.classList.contains('obstacle')) {
                        cell.classList.add('highlight');
                    }
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
    } else {
        const type = prompt('Enter type (unit/enemy/obstacle):');
        if (type === 'unit') {
            item.classList.add('unit');
            item.style.backgroundColor = 'blue';
            item.setAttribute('data-health', unitHealth);
            addHealthBar(item, unitHealth);
        } else if (type === 'enemy') {
            item.classList.add('enemy');
            item.style.backgroundColor = 'red';
            item.setAttribute('data-health', enemyHealth);
            addHealthBar(item, enemyHealth);
        } else if (type === 'obstacle') {
            item.classList.add('obstacle');
            item.style.backgroundColor = 'black';
        }
    }
}

function switchToMapBuilder() {
    mapBuilderMode = !mapBuilderMode;
    if (mapBuilderMode) {
        console.log('Switched to Map Builder Mode');
    } else {
        console.log('Switched to Game Mode');
    }
}

function exportMap() {
    const mapData = [];
    document.querySelectorAll('.grid-item').forEach(item => {
        const cellData = {
            unit: item.classList.contains('unit'),
            enemy: item.classList.contains('enemy'),
            obstacle: item.classList.contains('obstacle'),
            health: item.getAttribute('data-health')
        };
        mapData.push(cellData);
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
        document.querySelectorAll('.grid-item').forEach((item, index) => {
            const cellData = mapData[index];
            item.classList.remove('unit', 'enemy', 'obstacle');
            item.style.backgroundColor = 'lightgray';
            removeHealthBar(item);
            if (cellData.unit) {
                item.classList.add('unit');
                item.style.backgroundColor = 'blue';
                item.setAttribute('data-health', cellData.health);
                addHealthBar(item, cellData.health);
            } else if (cellData.enemy) {
                item.classList.add('enemy');
                item.style.backgroundColor = 'red';
                item.setAttribute('data-health', cellData.health);
                addHealthBar(item, cellData.health);
            } else if (cellData.obstacle) {
                item.classList.add('obstacle');
                item.style.backgroundColor = 'black';
            }
        });
    };
    reader.readAsText(file);
}

addEnemy(1);