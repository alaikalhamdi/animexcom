function getCellIndex(cell) {
    return Array.from(cell.parentNode.children).indexOf(cell);
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