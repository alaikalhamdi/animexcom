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
            } else if (!newCell.classList.contains('enemy') && !newCell.classList.contains('obstacle') && !newCell.classList.contains('spawn-point')) {
                newCell.classList.add('enemy');
                newCell.setAttribute('data-health', enemy.getAttribute('data-health'));
                newCell.setAttribute('data-sg', enemy.getAttribute('data-sg'));
                addStatusBar(newCell, enemy.getAttribute('data-health'), enemy.getAttribute('data-sg'));
                enemy.classList.remove('enemy');
                removeStatusBar(enemy);
                console.log('Enemy moved from', enemy, 'to', newCell);
                logAction(`Enemy moved from ${enemyIndex} to ${getCellIndex(newCell)}`);
            }
        }
    });
}

function attackUnit(enemy, unit) {
    let unitHealth = parseInt(unit.getAttribute('data-health'));
    let unitStab = parseInt(unit.getAttribute('data-sg'));
    const coverBonus = calculateCoverBonus(enemy, unit);
    const damageDealt = attackDamage - (Math.round((attackDamage * coverBonus) / 100));
    unitHealth -= damageDealt;
    unitStab -= stabShred;
    if (unitHealth <= 0) {
        unit.classList.remove('unit');
        console.log('Unit defeated by', enemy, 'at', unit);
        removeStatusBar(unit);
        removeUnitId(unit);
        totalUnits--;
        updateUnitsLeftDisplay();
        checkDefeatCondition();
    } else {
        updateHealthBar(unit, unitHealth);
        updateStabilityGauge(unit, unitStab);
        console.log('Unit attacked by', enemy, 'at', unit, 'remaining health:', unitHealth);
        logAction(`Unit attacked by enemy at ${getCellIndex(unit)}`);
        logAction(`Remaining health: ${unitHealth}`, false, true);
    }
}

function addEnemy(amount = 1) {
    for (let i = 0; i < amount; i++) {
        const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point):not(.empty)');
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.classList.add('enemy');
            randomCell.setAttribute('data-health', enemyHealth);
            randomCell.setAttribute('data-sg', maxStabilityGauge);
            addStatusBar(randomCell, enemyHealth, maxStabilityGauge);
            console.log('Enemy added at', randomCell);
        }
    }
}