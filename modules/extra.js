function getCellIndex(cell) {
    return Array.from(cell.parentNode.children).indexOf(cell);
}

function nextTurn() {
    turn++;
    unitsMoved = 0;
    movedUnits.clear();
    attackedUnits.clear();
    skippedUnits.clear();
    replenishMovementPoints();
    updateTurnDisplay();
    updateUnitsLeftDisplay();
    updateUnitsLeftList();
    console.log('Turn', turn);
    logAction(`Turn ${turn}`, true);
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
        // Determine cover direction (horizontal or vertical)
        const rowDiff = defenderRow - attackerRow;
        const colDiff = defenderCol - attackerCol;

        // Cover must be between attacker and defender
        const inBetween =
            Math.min(attackerRow, defenderRow) <= coverRow &&
            coverRow <= Math.max(attackerRow, defenderRow) &&
            Math.min(attackerCol, defenderCol) <= coverCol &&
            coverCol <= Math.max(attackerCol, defenderCol);

        if (!inBetween) return false;

        // **New: Expand the blocked area opposite to attacker**
        if (coverRow === defenderRow) {
            // Horizontal cover
            return (attackerCol < defenderCol && coverCol < defenderCol) || (attackerCol > defenderCol && coverCol > defenderCol);
        } else if (coverCol === defenderCol) {
            // Vertical cover
            return (attackerRow < defenderRow && coverRow < defenderRow) || (attackerRow > defenderRow && coverRow > defenderRow);
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
                return 35; // Full cover bonus
            } else if (cell.classList.contains('partial-cover')) {
                return 30; // Partial cover bonus
            } else if (cell.classList.contains('vault-start') || cell.classList.contains('vault-end')) {
                if (defender.classList.contains('vault-start') || defender.classList.contains('vault-end')) {
                    return 20; // Vault bonus
                }
            }
        }
    }

    return 0; // No cover
}
