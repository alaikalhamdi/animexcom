# Girls' Frontline 2: Exilium Simulator
A simple simulator for planning strategies in **Girls' Frontline 2: Exilium**.

This project is built with **pure HTML, CSS, and JavaScript**. Just open `index.html` to run the simulator. The primary goal of this project is to help me learn JavaScript, so development will continue as long as there's more to explore.

## Features
### 🗺️ Map Building
- **10x10 grid map** (resizable using the map builder feature).
- **Map builder** to add and remove enemies, units, and obstacles.
- **Obstacles** that block movement unless a unit has enough movement points.
- **Full & partial covers** that function as obstacles.
- **Vaults** that acts as covers but does not affect movement.
- **Export & import maps** using JSON.

### ⚔️ Combat & Movement
- **Unit spawning** at designated points.
- **Turn-based movement system** with tile highlighting for traversal. 
- **Obstacle-aware pathfinding** for refined movement.
- **Skills** that includes **Healing** and **AOE Attack**. 
- **Turn-based combat:**
  - **Click to attack** enemies within a **4-tile range**.
  - **Enemies move** 1 tile closer to the nearest unit per turn.
  - **Covers reduce damage** from attackers on the other side of the cover.

### 👀 View
- **Top-down** 2D view with different grid colors.
- **Scroll to zoom** and **Drag to move** implemented as camera system.

## Contributing
For feedback or suggestions, you can:
- **DM** `yuantaiga` on Discord.
- Use the **Issues** tab on GitHub.

If you want to contribute directly, I'll be setting up a **Projects** tab. Feel free to check for open issues or suggestions you'd like to work on!