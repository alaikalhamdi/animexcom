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
    const attackerIndex = getCellIndex(attacker);
    const defenderIndex = getCellIndex(defender);
    const attackerRow = Math.floor(attackerIndex / 10);
    const attackerCol = attackerIndex % 10;
    const defenderRow = Math.floor(defenderIndex / 10);
    const defenderCol = defenderIndex % 10;

    const isCoverInWay = (coverRow, coverCol) => {
        const rowDiff = defenderRow - attackerRow;
        const colDiff = defenderCol - attackerCol;
        return (coverRow - attackerRow) * colDiff === (coverCol - attackerCol) * rowDiff;
    };

    const adjacentCells = [
        { row: defenderRow, col: defenderCol - 1 },
        { row: defenderRow, col: defenderCol + 1 },
        { row: defenderRow - 1, col: defenderCol },
        { row: defenderRow + 1, col: defenderCol }
    ];

    for (const { row, col } of adjacentCells) {
        const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
        if (cell && isCoverInWay(row, col)) {
            if (cell.classList.contains('full-cover')) {
                return 10; // Full cover bonus
            } else if (cell.classList.contains('partial-cover')) {
                return 5; // Partial cover bonus
            }
        }
    }

    return 0; // No cover
}