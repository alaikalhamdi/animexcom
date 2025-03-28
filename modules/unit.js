function toggleButtons(show) {
    const displayStyle = show ? 'inline-block' : 'none';
    document.querySelectorAll('.skill-button').forEach(button => {
        button.style.display = displayStyle;
    });
    document.getElementById('skip-turn-button').style.display = displayStyle;
}

function cancelUnitSelection() {
    if (selectedUnit) {
        selectedUnit.classList.remove('selected');
        clearHighlights();
        clearAttackLine();
        selectedUnit = null;
        selectedEnemy = null;
        console.log('Unit selection canceled');
        toggleButtons(false);
    }
}

function selectUnit(item) {
    if (item.classList.contains('unit')) {
        selectedUnit = item;
        item.classList.add('selected');
        console.log('Unit selected:', item);
        highlightMoves(item);
        highlightAttackRange(item);
        toggleButtons(true);
    }
}

function moveUnit(unit, target) {
    const path = findPath(unit, target);
    const unitMP = parseInt(unit.getAttribute('data-mp'));
    if (path.length - 1 <= unitMP && !target.classList.contains('unit') && !target.classList.contains('obstacle') && target.classList.contains('confirm-move')) {
        target.classList.add('unit');
        unit.classList.remove('unit');
        unit.classList.remove('selected');
        target.setAttribute('data-id', unit.getAttribute('data-id'));
        target.setAttribute('data-ci', unit.getAttribute('data-ci'));
        target.setAttribute('data-sg', unit.getAttribute('data-sg'));
        target.setAttribute('data-health', unit.getAttribute('data-health'));
        target.setAttribute('data-mp', unitMP - (path.length - 1));

        const statusBar = unit.querySelector('.status-bar');
        if (statusBar) {
            removeStatusBar(unit);
            target.appendChild(statusBar);
        } else {
            addStatusBar(target, unit.getAttribute('data-health'), unit.getAttribute('data-sg'));
        }

        const unitIdLabel = unit.querySelector('.unit-id');
        if (unitIdLabel) {
            unit.removeChild(unitIdLabel);
            target.appendChild(unitIdLabel);
        }

        console.log('Unit moved from', unit, 'to', target);
        logAction(`Unit ${target.getAttribute('data-id')} moved from ${getCellIndex(unit)} to ${getCellIndex(target)}`);
        clearHighlights();
        movedUnits.add(target);
        attackedUnits.delete(unit); // Allow the unit to attack after moving
        unitsMoved++;
        updateUnitsLeftDisplay();
        updateUnitsLeftList();
        if (unitsMoved >= totalUnits) {
            nextTurn();
        }
        toggleButtons(false);
    } else {
        throw new Error('Invalid move');
    }
}

function attackEnemy(unit, enemy) {
    let enemyHealth = parseInt(enemy.getAttribute('data-health'));
    let enemyStab = parseInt(enemy.getAttribute('data-sg'))
    const coverBonus = calculateCoverBonus(unit, enemy);
    const damageDealt = attackDamage - (Math.round((attackDamage * coverBonus) / 100));
    enemyHealth -= damageDealt;
    enemyStab -= stabShred;
    console.log('Damage dealt by', unit, 'to', enemy, ':', damageDealt);
    if (enemyHealth <= 0) {
        enemy.classList.remove('enemy');
        console.log('Enemy defeated by', unit, 'at', enemy);
        logAction(`Enemy defeated by unit ${unit.getAttribute('data-id')}`);
        removeStatusBar(enemy);
        checkVictoryCondition();
    } else {
        updateHealthBar(enemy, enemyHealth);
        updateStabilityGauge(enemy, enemyStab);
        console.log('Enemy attacked by', unit, 'at', enemy, 'remaining health:', enemyHealth);
        logAction(`Enemy attacked by unit ${unit.getAttribute('data-id')}`);
        logAction(`Remaining health: ${enemyHealth}`, false, true);
    }
    unit.classList.remove('selected');
    clearHighlights('highlight');
    clearHighlights('attack-range');
    attackedUnits.add(unit);
    toggleButtons(false);
}

function addUnitToSpawnPoint(spawnPoint) {
    spawnPoint.classList.add('unit');
    spawnPoint.setAttribute('data-health', unitHealth);
    spawnPoint.setAttribute('data-ci', confectanceIndex);
    spawnPoint.setAttribute('data-sg', maxStabilityGauge);
    spawnPoint.setAttribute('data-mp', unitMovementPoints);
    spawnPoint.setAttribute('data-id', unitCounter);
    const unitIdLabel = document.createElement('div');
    unitIdLabel.classList.add('unit-id');
    unitIdLabel.textContent = unitCounter;
    spawnPoint.appendChild(unitIdLabel);
    addStatusBar(spawnPoint, unitHealth, maxStabilityGauge);
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
                if (!visited.has(neighbor) && !neighborCell.classList.contains('obstacle') && !neighborCell.classList.contains('enemy') && !neighborCell.classList.contains('empty')) {
                    queue.push([neighborRow, neighborCol]);
                    visited.add(neighbor);
                    cameFrom[neighbor] = `${currentRow},${currentCol}`;
                }
            }
        }
    }

    return [];
}

function skipTurn() {
    if (selectedUnit) {
        console.log('Turn skipped for unit:', selectedUnit);
        selectedUnit.setAttribute('data-mp', 0);
        movedUnits.add(selectedUnit);
        skippedUnits.add(selectedUnit);
        unitsMoved++;
        updateUnitsLeftDisplay();
        updateUnitsLeftList();
        if (unitsMoved >= totalUnits) {
            nextTurn();
        }
        cancelUnitSelection();
    }
}

function canUnitShoot(unit) {
    return !attackedUnits.has(unit) && !skippedUnits.has(unit) && !movedUnits.has(unit);
}