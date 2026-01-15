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

// FIX ERROR HERE
const soundManager = new SoundManager(); 
async function initSounds() {
    await soundManager.init();

    await Promise.all([
        soundManager.load("drop", "audio/drop.wav"),
        soundManager.load("wildcard", "audio/wildcard.wav"),
    ]);
} window.addEventListener("load", initSounds);

let soundsON; const sounds = storage.options.sounds;
if(sounds !== null) soundsON = sounds;
else soundsON = true;
const soundsCheckBoxHTML = document.querySelector(".sounds-check");
if(soundsON) soundsCheckBoxHTML.checked = true;
else soundsCheckBoxHTML.checked = false;

let autograbON; const autograb = storage.options.autograb;
if(autograb !== null) autograbON = autograb;
else autograbON = true;
const autograbCheckBoxHTML = document.querySelector(".autograb-check");
if(autograbON) autograbCheckBoxHTML.checked = true;
else autograbCheckBoxHTML.checked = false;


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
    gameOverContainerHTML.innerHTML = "Game Over!"
    gameOverContainerHTML.style.fontSize = "56px";
    gameOverContainerHTML.style.color = "#6E6E73";
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

    soundsON = soundsCheckBoxHTML.checked; storage.save("options-sounds", soundsCheckBoxHTML.checked);
    autograbON = autograbCheckBoxHTML.checked; storage.save("options-autograb", autograbCheckBoxHTML.checked);

    if (autograbON && board.currentTile && !board.currentTile.dropped) board.currentTile.grab();

}; document.addEventListener("mousedown", (e) => {if(!settingsWindowHTML.contains(e.target)) closeSettings()});

// fix the failed indication of empty tile holders after game over
// fix the combo nullifying error

// sounds: button click, gameover, reset

