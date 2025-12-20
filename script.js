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


const gameOverContainerHTML = document.querySelector(".game-over-container"); let isGameOver = false;
const gameOver = () => {
    isGameOver = true;

    board.gameOverFadeOut();

    gameOverContainerHTML.classList.remove("show");
    void gameOverContainerHTML.offsetWidth; // restart animation
    gameOverContainerHTML.classList.add("show");

    tc.clearRect(0 ,0, tileCanvas.width, tileCanvas.height);
    setTimeout(() => {board.reset()}, 1500);
};

const settingsWindowHTML = document.querySelector(".settings-window");
const settingsOverlayHTML = document.querySelector(".settings-overlay");
const openSettings = () => {
    settingsWindowHTML.style.display = "flex"; 
    settingsOverlayHTML.style.display = "block";
}
const closeSettings = () => {
    settingsWindowHTML.style.display = "none";
    settingsOverlayHTML.style.display = "none";
}; document.addEventListener("mousedown", (e) => {if(!settingsWindowHTML.contains(e.target)) closeSettings()});





window.document.addEventListener('keydown', (e) => {
    if(e.key === 'q') board.reset()
    if (e.key === 'f') board.gameOverFadeOut()
    if(e.key === 'g') gameOver()

});


// get settings to work: sounds, autograb, lucky tile request