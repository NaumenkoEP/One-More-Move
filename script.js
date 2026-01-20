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
        soundManager.load("chime", "audio/combo-chime-1.wav"),
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

let emptyIndicationON; const emptyIndication = storage.options.emptyIndication;
if(emptyIndication !== null) emptyIndicationON = emptyIndication;
else emptyIndicationON = true;
const emptyIndicationCheckBoxHTML = document.querySelector(".emptyindication-check");
if(emptyIndicationON) emptyIndicationCheckBoxHTML.checked = true;
else emptyIndicationCheckBoxHTML.checked = false;


const initNewGame = () => {
    tileCanvas.width = size; tileCanvas.height = board.tileSize + board.previewTileSize / 2;
    scoreCanvas.width = size; scoreCanvas.height = board.tileSize + 20;
    
    board.initialise();
}; initNewGame();

const reviveWindowHTML = document.querySelector(".revive-window");
const reviveButtonHTML = document.querySelector(".revive-button");
const settingsOverlayHTML = document.querySelector(".settings-overlay");
const timerHTML = reviveWindowHTML.querySelector(".timer");
let countInterval;
let reviveOfferDeclined;
const offerRevive = () => {
    reviveOfferDeclined = false;

    reviveWindowHTML.style.display = "flex";
    reviveButtonHTML.classList.add("pulse");
    settingsOverlayHTML.style.display = "flex";

    let c = 5;
    timerHTML.textContent = c;

    countInterval = setInterval(() => {
        c--;
        timerHTML.innerHTML = c;

        if (c < 1 || reviveOfferDeclined) {
            clearInterval(countInterval);
            hideReviveWindow();
            gameOver();
        }
    }, 1000);
};

// TODO WITH SDK
const requestRevive = () => {
    clearInterval(countInterval);
    reviveOfferDeclined = false;

    grantRevive();
};
const hideReviveWindow = () => {
    reviveButtonHTML.classList.remove("pulse");
    reviveWindowHTML.style.display = "none";
    settingsOverlayHTML.style.display = "none";
};
document.addEventListener("mousedown", (e) => {
    if (reviveWindowHTML.style.display !== "flex") return;

    if (!reviveWindowHTML.contains(e.target)) {
        reviveOfferDeclined = true;
        clearInterval(countInterval);
        hideReviveWindow();
        gameOver();
    }
});
async function grantRevive() {
    const tiles = board.tileGrid;
    const fadePromises = [];
    for (let row = 0; row < board.dimentions; row++) {
        for (let col = 0; col < board.dimentions; col++) {
            const tile = tiles[row][col];

            if (tile && Number(tile.value) < 5) {
                fadePromises.push(
                    tile.fadeOutAnimation().then(() => {
                        tiles[row][col] = 0;
                        tile.hoveredHolder.empty = true;
                        tile.hoveredHolder.indicateEmpty();
                    })
                );
            }
        }
    }
    await Promise.all(fadePromises);
    hideReviveWindow();
}


const gameOverContainerHTML = document.querySelector(".game-over-container"); let isGameOver = false;
const gameOver = () => {
    hideReviveWindow();

    isGameOver = true;
    board.notResetNorGameOver = true;

    board.gameOverFadeOut();

    gameOverContainerHTML.classList.remove("show");
    gameOverContainerHTML.innerHTML = "Game Over!"
    gameOverContainerHTML.style.fontSize = "56px";
    gameOverContainerHTML.style.color = "#6E6E73";
    void gameOverContainerHTML.offsetWidth; 
    gameOverContainerHTML.classList.add("show");

    tc.clearRect(0 ,0, tileCanvas.width, tileCanvas.height);
    setTimeout(() => {board.reset()}, 1500);
}; if(board.getEmptyCells() < 1) gameOver();


const settingsWindowHTML = document.querySelector(".settings-window");
const openSettings = () => {
    settingsWindowHTML.style.display = "flex"; 
    settingsOverlayHTML.style.display = "block";
}
const closeSettings = () => {
    settingsWindowHTML.style.display = "none";
    settingsOverlayHTML.style.display = "none";

    soundsON = soundsCheckBoxHTML.checked; storage.save("options-sounds", soundsCheckBoxHTML.checked);
    autograbON = autograbCheckBoxHTML.checked; storage.save("options-autograb", autograbCheckBoxHTML.checked);
    emptyIndicationON = emptyIndicationCheckBoxHTML.checked; storage.save("options-empty-indication", emptyIndicationCheckBoxHTML.checked);

    if (autograbON && board.currentTile && !board.currentTile.dropped) board.currentTile.grab();

}; document.addEventListener("mousedown", (e) => {if(!settingsWindowHTML.contains(e.target)) closeSettings()});

// interstitial ads logic
// sounds: button click, gameover, reset
// finish the tier on the revive window 

// UTILITY TEST
document.addEventListener("keydown", (e) => { if(e.key === "g") offerRevive() });