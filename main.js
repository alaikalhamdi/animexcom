const GRID_SIZE = 100;
const moveLimit  = 3;
const attackRange = 4;
const unitHealth = 100;
const enemyHealth = 100;
const attackDamage = 30;
const unitMovementPoints = 3;   
let GRID_LENGTH = 10;
let GRID_WIDTH = 10;
let mapBuilderMode = false;
let unitsMoved = 0;
let totalUnits = 0;
let selectedUnit = null;
let selectedEnemy = null;
let turn = 0;
let movedUnits = new Set();
let attackedUnits = new Set();
let skippedUnits = new Set();
let unitCounter = 0;
generateGrid(GRID_LENGTH, GRID_WIDTH);

addObstacles();
addSpawnPoints();
addEnemy(1);
addVaults();

document.querySelector('.grid-container').addEventListener('click', (event) => {
    if (event.target.classList.contains('grid-item', 'attack-indicator')) {
        handleGridItemClick(event.target);
    }
});

['heal', 'overwatch', 'aoeAttack'].forEach(skill => {
    document.getElementById(skill).addEventListener('click', () => useSkill(skill));
});

document.getElementById('resetGrid').addEventListener('click', () => resetGrid());

document.getElementById('grid-length').addEventListener('change', resizeGrid);
document.getElementById('grid-width').addEventListener('change', resizeGrid);

document.getElementById('importMapInput').addEventListener('change', e => importMap(e));
document.getElementById('exportMap').addEventListener('click', () => exportMap());