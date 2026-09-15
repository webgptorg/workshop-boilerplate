Create a simple game with a map and the ability to build cities.


- The game map should be the most prominent part of the app. It should fill the entire screen and should be draggable by mouse.
- The game should have medieval vibe and look nice. 
- For now, you are not implementing gameplay, like resources, game turns, or players. You are just drafting the perfect game map with free mode and free resources. 
- For now, the game will be single-player versus some hard-coded AI.  

## UI

- The UI should be minimalistic. 
- There should be no bullshit texts or things. There should be just a very simple, minimalistic tray and buildings you can select and build from. 
- Get inspiration from the Mac app tray. 
- There should be only a map and a simple tray on the bottom with the buildings. 
- No branding, compass, controls, some fake game information, etc. This will be added later. 
- When I am looking through the map, the map should be properly generated as I am going on. The generation should be seamless and should not show any loading or abrupt changes. I should never ever see the empty map. There should always be something. 

## Graphics

- The graphics should have a consistent low-poly isometric style throughout the game.
- The light should be only emissive. There should be no shadows in the game. 

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

### Terrain (Types)

Ground
- Grass
- Sand
- Rocks
- Gravel
- Forest bed

Water
- Ocean - do not distinguish between types of water. There should be just one type of water for sea, ocean, deep water, rivers, etc. The multiple types of water will be added later. 


There should be some procedural algorithm which can generate an infinitely large map which makes sense. It has natural-looking islands, rivers, mountains, deserts, etc. 

Get inspiration from Minecraft and other procedurally generated games. 


### Terrain (Visuals)

- There should be some procedural algorithm which can generate the visual of the terrain. 
- Be aware that this algorithm is a different procedural algorithm than the generating terrain types. 
- One algorithm generates the types of the terrain, and this algorithm generates the actual graphic, the pixels on the screen, and a smooth transition between each terrain type.
- There should be some logic between the terrain transitions. For example, when the sand, grass, rocks, or gravel is falling to the water, it should have some logic. 
- Same with other transitions, for example, when the grass and sand touch. The transition should look natural and follow the logic of the terrain types.

## Buildings

### Buildings (Game logic)

- Buildings should be placed on the grid and should align with the isometric perspective.
- Buildings should be low-poly but visually appealing, not just icons, but real buildings on a real map. 
- Player starts with the town center.
- Other buildings can be constructed by the player on available grid spaces.

### Buildings (types)

- Town Center
- House
- Farm
- Barracks
- Market
- Workshop
- Blacksmith
- Stable
- Watchtower

### Natural "buildings" (types)

- Tree
- Rock
- Bush

### Buildings (Graphics)

- Each building should have a nice low-poly isometric visual. 
- There should be no icon for the building. The building in the tray should be exactly the same picture as the building on the map - there should be a one-to-one visual representation.

## Misc

- Notice that there are two things: the terrain type: "forest bed", and natural building type: "tree". 
- This is kind of a special pair because it should occur together during the world generation, but in the data representation, it exists separately. 


## Code quality

- Create abstractions. For example, for the Turing transitions, there should be some reusable system which will work modularly. 
- Do not hardcode anything. Everything should be like a plugin. Each building and terrain should be plugable.
- Ensure that the code is modular and maintainable, allowing for easy addition of new features and content without modifying the core systems.