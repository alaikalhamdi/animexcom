import { addHealthBar, updateUnitsLeftDisplay, updateUnitsLeftList, highlightMoves, highlightAttackRange, clearHighlights, updateHealthBar, removeHealthBar, checkVictoryCondition } from "./ui.js";
import { getCellIndex, nextTurn, calculateCoverBonus } from "./extra.js";

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

export { cancelUnitSelection, selectUnit, moveUnit, attackEnemy, addUnitToSpawnPoint, findPath };