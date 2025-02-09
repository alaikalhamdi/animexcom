# Girls' Frontline 2: Exilium Simulator
A simple simulator for planning strategies in **Girls' Frontline 2: Exilium**.

This project is built with **pure HTML, CSS, and JavaScript**. Just open `index.html` to run the simulator. The primary goal of this project is to help me learn JavaScript, so development will continue as long as there's more to explore.

## Features
### 🗺️ Map Building
- **10x10 grid map** (resizable using the map builder feature).
- **Map builder** to add and remove enemies, units, and obstacles.
- **Obstacles** that block movement unless a unit has enough movement points.
- **Full & partial covers** that function as obstacles.
- **Export & import maps** using JSON.

### ⚔️ Combat & Movement
- **Unit spawning** at designated points.
- **Turn-based movement system** with tile highlighting for traversal. 
- **Obstacle-aware pathfinding** for refined movement.
- **Turn-based combat:**
  - **Click to attack** enemies within a **2-tile range**.
  - **Enemies move** 1 tile closer to the nearest unit per turn.
  - **Melee attacks** when an enemy is adjacent (1 tile away).
  - **Covers reduce damage** if they are positioned between the attacker and target.

## Contributing
For feedback or suggestions, you can:
- **DM** `yuantaiga` on Discord.
- Use the **Issues** tab on GitHub.

If you want to contribute directly, I'll be setting up a **Projects** tab. Feel free to check for open issues or suggestions you'd like to work on!