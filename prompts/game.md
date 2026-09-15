Create a simple game with a map and the ability to build cities.


- The game map should be the most prominent part of the app. It should fill the entire screen and should be draggable by mouse.
- The game should have medieval vibe and look nice. 
- For now, you are not implementing gameplay, like resources, game turns, or players. You are just drafting the perfect game map with free mode and free resources. 
- For now, the game will be single-player versus some hard-coded AI.  

## UI

- The UI should be minimalistic. 
- There should be only a map and a simple tray on the bottom with the buildings. 
- No branding, compass, controls, some fake game information, etc. This will be added later. 


## Map

- Map should be grid-based. 
- It should be rendered isometrically. 
- There should be two distinct layers: the terrain and buildings. 
- The terrain shouldn't be tiled. The tiles should have smooth transitions. 
- The map can be dragged by mouse or touch or arrow keys
- The map cannot be zoomed in or zoomed out. There should be only one zoom level. 


## Terrain

- Terrain should cover the entire map and should be visually distinct from buildings.
- Train is procedurally generated, and the game map is technically infinite. 
- There are two general types of terrain: water and ground. 
- On the water, you cannot build buildings. 
- On the ground, there should be multiple tiles, like grass, sand, rocks, and gravel,...
- The data for the terrain are grid-based, but the visual of the terrain itself should be procedurally generated. 


## Buildings

- Buildings should be placed on the grid and should align with the isometric perspective.
- Buildings should be low-poly but visually appealing, not just icons, but real buildings on a real map. 
- Player starts with the town center.
- Other buildings can be constructed by the player on available grid spaces.