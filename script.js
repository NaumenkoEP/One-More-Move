const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const size = isMobile
    ? Math.max(Math.min(innerWidth - 20, innerHeight * 0.9), 260)
    : Math.max(Math.min(innerHeight / 1.7, innerWidth - 20), 430);

const gameCanvas = document.querySelector(".game-canvas"); const gc = gameCanvas.getContext("2d");
gameCanvas.width = size; gameCanvas.height = size;
const tileCanvas = document.querySelector(".tile-canvas"); const tc = tileCanvas.getContext("2d");
const scoreCanvas = document.querySelector(".score-canvas"); const sc = scoreCanvas.getContext("2d");

const headerHTML = document.querySelector(".game-borders .header");
window.addEventListener("load", () => {headerHTML.style.width = size + "px"});

const storage = new MemoryManager(); const board = new BoardManager();

const initNewGame = () => {
    tileCanvas.width = size; tileCanvas.height = board.tileSize + board.previewTileSize / 2;
    scoreCanvas.width = size; scoreCanvas.height = board.tileSize + 20;
    
    board.initialise();
}; initNewGame();


const gameOver = () => {
    console.log("game over!")
}


// storage.clear()

// finish best score logic, refine UI
// fix the tile erasing bug in preview and on board
// add several more colors for the tiles

// add settings logic + UI: autograb, watch ad for wildcard, start again, 
// New Game / Game Over logic + UI

window.document.addEventListener('keydown', (e) => {if(e.key === 'q') board.reset()});
