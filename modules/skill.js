const skills = {
    heal: { cooldown: 3, effect: healUnit },
    overwatch: { cooldown: 5, effect: overwatch },
    aoeAttack: { cooldown: 4, effect: aoeAttack }
};
const skillCooldowns = {
    heal: 0,
    overwatch: 0,
    aoeAttack: 0
};

function useSkill(skillName) {
    if (skillCooldowns[skillName] > 0) {
        console.log(`${skillName} is on cooldown for ${skillCooldowns[skillName]} more turns.`);
        return;
    }
    const skill = skills[skillName];
    if (selectedUnit && skill) {
        skill.effect(selectedUnit);
        skillCooldowns[skillName] = skill.cooldown;
        console.log(`${skillName} used by unit`, selectedUnit);
        updateSkillCooldownText(skillName);
    } else {
        console.log('No unit selected or invalid skill.');
    }
}

function healUnit(unit) {
    let health = parseInt(unit.getAttribute('data-health'));
    health = Math.min(health + 20, 100); // Heal 20 health points, max 100
    unit.setAttribute('data-health', health);
    updateHealthBar(unit, health);
    console.log('Unit healed:', unit);
}

function overwatch(unit) {
    unit.classList.add('overwatch');
    console.log('Unit set to overwatch:', unit);
}

function aoeAttack(unit) {
    const unitIndex = getCellIndex(unit);
    const unitRow = Math.floor(unitIndex / 10);
    const unitCol = unitIndex % 10;

    for (let row = unitRow - 1; row <= unitRow + 1; row++) {
        for (let col = unitCol - 1; col <= unitCol + 1; col++) {
            if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                const cell = document.querySelector(`.grid-container > div:nth-child(${row * 10 + col + 1})`);
                if (cell.classList.contains('enemy')) {
                    let enemyHealth = parseInt(cell.getAttribute('data-health'));
                    enemyHealth -= 15; // AOE attack deals 15 damage
                    if (enemyHealth <= 0) {
                        cell.classList.remove('enemy');
                        removeHealthBar(cell);
                        console.log('Enemy defeated by AOE attack at', cell);
                        checkVictoryCondition();
                    } else {
                        cell.setAttribute('data-health', enemyHealth);
                        updateHealthBar(cell, enemyHealth);
                        console.log('Enemy hit by AOE attack at', cell, 'remaining health:', enemyHealth);
                    }
                }
            }
        }
    }
}

function updateSkillCooldowns() {
    for (const skill in skillCooldowns) {
        if (skillCooldowns[skill] > 0) {
            skillCooldowns[skill]--;
            updateSkillCooldownText(skill);
        }
    }
}

function updateSkillCooldownText(skill) {
    const cooldownElement = document.getElementById(`${skill}-cooldown`);
    const skillButton = document.getElementById(`${skill}`);
    if (skillCooldowns[skill] > 0) {
        cooldownElement.textContent = '( ' + skillCooldowns[skill] + ' )';
        skillButton.disabled = true;
    } else {
        cooldownElement.textContent = '';
        skillButton.disabled = false;
    }
}