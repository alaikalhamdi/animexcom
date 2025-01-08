import { generateGrid, addObstacles, addSpawnPoints, resetGrid, resizeGrid } from './modules/generateGrid.js';
import { handleGridItemClick, handleGridItemMouseOver, handleGridItemMouseOut } from './modules/ui.js';
import { useSkill } from './modules/skill.js';
import { addEnemy } from './modules/enemies.js';
import { importMap, exportMap } from './mapBuilder.js';

let GRID_LENGTH = 10;
let GRID_WIDTH = 10;

generateGrid(GRID_LENGTH, GRID_WIDTH);

addObstacles();
addSpawnPoints();
addEnemy(1);

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => handleGridItemClick(item));
    item.addEventListener('mouseover', () => handleGridItemMouseOver(item));
    item.addEventListener('mouseout', () => handleGridItemMouseOut(item));
});

['heal', 'overwatch', 'aoeAttack'].forEach(skill => {
    document.getElementById(skill).addEventListener('click', () => useSkill(skill));
});

document.getElementById('resetGrid').addEventListener('click', () => resetGrid());

document.getElementById('grid-length').addEventListener('change', resizeGrid);
document.getElementById('grid-width').addEventListener('change', resizeGrid);

document.getElementById('importMapInput').addEventListener('change', e => importMap(e));
document.getElementById('exportMap').addEventListener('click', () => exportMap());