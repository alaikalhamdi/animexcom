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
    const attackerRow = Math.floor(attackerIndex / GRID_WIDTH);
    const attackerCol = attackerIndex % GRID_WIDTH;
    const defenderRow = Math.floor(defenderIndex / GRID_WIDTH);
    const defenderCol = defenderIndex % GRID_WIDTH;

    const isCoverInWay = (coverRow, coverCol) => {
        const rowDiff = defenderRow - attackerRow;
        const colDiff = defenderCol - attackerCol;
        if ((coverRow - attackerRow) * colDiff === (coverCol - attackerCol) * rowDiff) {
            return (
                Math.min(attackerRow, defenderRow) <= coverRow && coverRow <= Math.max(attackerRow, defenderRow) &&
                Math.min(attackerCol, defenderCol) <= coverCol && coverCol <= Math.max(attackerCol, defenderCol)
            );
        }
        return false;
    };

    const adjacentCells = [
        { row: defenderRow, col: defenderCol - 1 },
        { row: defenderRow, col: defenderCol + 1 },
        { row: defenderRow - 1, col: defenderCol },
        { row: defenderRow + 1, col: defenderCol }
    ];

    for (const { row, col } of adjacentCells) {
        const cell = document.querySelector(`.grid-container > div:nth-child(${row * GRID_WIDTH + col + 1})`);
        if (cell && isCoverInWay(row, col)) {
            if (cell.classList.contains('full-cover')) {
                return 10; // Full cover bonus
            } else if (cell.classList.contains('partial-cover')) {
                return 5; // Partial cover bonus
            } else if (cell.classList.contains('vault-start') || cell.classList.contains('vault-end')) {
                return 5; // Vault bonus
            }
        }
    }

    return 0; // No cover
}