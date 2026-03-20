/**
 * Collision Detection System for Game Map
 * Checks character position against building boundaries
 */

// Building bounding boxes (calculated based on Map.css positions)
// These are approximate and can be refined based on visual testing
const BUILDINGS = [
  {
    name: "lab",
    getBox: () => {
      const percentLeft = 5;
      const percentTop = 5;
      const width = 400;
      const height = 400;
      return {
        x: (percentLeft * window.innerWidth) / 100,
        y: (percentTop * window.innerHeight) / 100,
        width: width,
        height: height,
      };
    },
  },
  {
    name: "hospital",
    getBox: () => {
      const percentRight = 5;
      const percentTop = 5;
      const width = 400;
      const height = 400;
      return {
        x: window.innerWidth - (percentRight * window.innerWidth) / 100 - width,
        y: (percentTop * window.innerHeight) / 100,
        width: width,
        height: height,
      };
    },
  },
  {
    name: "server",
    getBox: () => {
      const percentLeft = 30;
      const percentTop = 25;
      const width = 500;
      const height = 500;
      return {
        x: (percentLeft * window.innerWidth) / 100,
        y: (percentTop * window.innerHeight) / 100,
        width: width,
        height: height,
      };
    },
  },
  {
    name: "military",
    getBox: () => {
      const percentLeft = 5;
      const width = 400;
      const height = 400;
      return {
        x: (percentLeft * window.innerWidth) / 100,
        y: window.innerHeight - height,
        width: width,
        height: height,
      };
    },
  },
  {
    name: "house",
    getBox: () => {
      const percentRight = 5;
      const percentBottom = 5;
      const width = 400;
      const height = 400;
      return {
        x: window.innerWidth - (percentRight * window.innerWidth) / 100 - width,
        y: window.innerHeight - (percentBottom * window.innerHeight) / 100 - height,
        width: width,
        height: height,
      };
    },
  },
];

/**
 * Check if character bounding box collides with any building
 * @param {Object} charBounds - Character bounding box { x, y, width, height }
 * @returns {boolean} - True if collision detected, false otherwise
 */
export function checkCollisions(charBounds) {
  return BUILDINGS.some((building) => {
    const buildingBox = building.getBox();
    return (
      charBounds.x < buildingBox.x + buildingBox.width &&
      charBounds.x + charBounds.width > buildingBox.x &&
      charBounds.y < buildingBox.y + buildingBox.height &&
      charBounds.y + charBounds.height > buildingBox.y
    );
  });
}

/**
 * Debug function to visualize building boundaries
 * Call this in browser console to see collision boxes
 */
export function visualizeCollisionBoxes() {
  BUILDINGS.forEach((building) => {
    const box = building.getBox();
    const div = document.createElement("div");
    div.style.cssText = `
      position: absolute;
      left: ${box.x}px;
      top: ${box.y}px;
      width: ${box.width}px;
      height: ${box.height}px;
      border: 3px dashed lime;
      pointer-events: none;
      z-index: 1000;
    `;
    document.querySelector(".map-container").appendChild(div);
  });
  console.log("Collision boxes visualized! (Press Ctrl+F5 to clear)");
}

// Uncomment to enable debug visualization on page load:
// if (process.env.NODE_ENV === 'development') {
//   window.visualizeCollisionBoxes = visualizeCollisionBoxes;
// }
