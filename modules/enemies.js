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
                addHealthBar(newCell, enemy.getAttribute('data-health'));
                enemy.classList.remove('enemy');
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
        console.log('Unit defeated by', enemy, 'at', unit);
        removeHealthBar(unit);
        removeUnitId(unit);
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
        const emptyCells = document.querySelectorAll('.grid-item:not(.unit):not(.enemy):not(.obstacle):not(.spawn-point):not(.empty)');
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.classList.add('enemy');
            randomCell.setAttribute('data-health', enemyHealth);
            addHealthBar(randomCell, enemyHealth);
            console.log('Enemy added at', randomCell);
        }
    }
}