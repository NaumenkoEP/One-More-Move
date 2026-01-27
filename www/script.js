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

const now = () => { return window.performance.now(); };

const storage = new MemoryManager(); const board = new BoardManager();
const soundManager = new SoundManager(); const adManager = new AdManager();

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

async function initSounds() {
    await soundManager.init();

    await Promise.all([
        soundManager.load("drop", "audio/drop.wav"),
        soundManager.load("wildcard", "audio/wildcard.wav"),
        soundManager.load("chime", "audio/combo-chime-1.wav"),
        soundManager.load("click", "audio/ui-click.wav"),
        soundManager.load("game-over", "audio/game-over.wav")
    ]);
} window.addEventListener("load", initSounds);

const initNewGame = () => {
    tileCanvas.width = size; tileCanvas.height = board.tileSize + board.previewTileSize / 2;
    scoreCanvas.width = size; scoreCanvas.height = board.tileSize + 20;
    
    board.initialise();
}; initNewGame();

const reviveWindowHTML = document.querySelector(".revive-window");
const reviveButtonHTML = document.querySelector(".revive-button");
const settingsOverlayHTML = document.querySelector(".settings-overlay");
const timerHTML = reviveWindowHTML.querySelector(".timer");
let reviveOfferDeclined = false; let reviveRafId = null;
const offerRevive = () => {
    reviveWindowHTML.style.display = "flex";
    reviveButtonHTML.classList.add("pulse");
    settingsOverlayHTML.style.display = "flex";

    const timerCanvas = document.querySelector(".timer-canvas");
    const ctx = timerCanvas.getContext("2d");

    const size = 290;
    timerCanvas.width = size;
    timerCanvas.height = size;

    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    const radius = 100;
    const center = size / 2;
    const fullCircle = Math.PI * 2;

    const draw = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, size, size);

        // background circle
        ctx.strokeStyle = "#F3F4F6";
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, fullCircle);
        ctx.stroke();

        // foreground circle
        // ctx.strokeStyle = " #6E6E73";
        ctx.strokeStyle = " #4FC9B0";
        ctx.beginPath();
        ctx.arc(
            center,
            center,
            radius,
            -Math.PI / 2,
            -Math.PI / 2 + fullCircle * (1 - progress)
        );
        ctx.stroke();

        // number
        const secondsLeft = Math.ceil((duration - elapsed) / 1000);
        ctx.fillStyle = "#2E2E2E";
        ctx.font = `45px ${board.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.max(secondsLeft, 0), center, center);

        if (progress < 1 && !reviveOfferDeclined) {
            reviveRafId = requestAnimationFrame(draw);
        } else {
            hideReviveWindow();
            gameOver();
        }
    };

    reviveRafId = requestAnimationFrame(draw);
};
const requestRevive = () => {
    stopReviveTimer();
    
    adManager.showRewardedAd({
        onSuccess: () => grantRevive(),
        onFail: () => gameOver()
    });

    grantRevive();

    if (soundsON) soundManager.play("click");
};
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

const stopReviveTimer = () => {
    reviveOfferDeclined = true;

    if (reviveRafId !== null) {
        cancelAnimationFrame(reviveRafId);
        reviveRafId = null;
    }
};
const hideReviveWindow = () => {
    reviveButtonHTML.classList.remove("pulse");
    reviveWindowHTML.style.display = "none";
    settingsOverlayHTML.style.display = "none";

};
document.addEventListener("mousedown", (e) => {
    if (reviveWindowHTML.style.display !== "flex") return;

    if (!reviveWindowHTML.contains(e.target)) {
        stopReviveTimer();
        hideReviveWindow();
        gameOver();

        if (soundsON) soundManager.play("click");
    }
});

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
    setTimeout(() => {
        board.reset();

        for (let row of board.holderGrid) {
            for (let holder of row) {
                holder.empty = true;
                holder.indicateEmpty();
            }
        }
    }, 1500);

    if (soundsON) soundManager.play("game-over");
}; if(board.getEmptyCells() < 1) gameOver();


const settingsWindowHTML = document.querySelector(".settings-window");
let settingsOpen = false;
const openSettings = () => {
    settingsWindowHTML.style.display = "flex"; 
    settingsOverlayHTML.style.display = "block";

    settingsOpen = true;
    
    if (soundsON) soundManager.play("click");
}
const closeSettings = () => {
    settingsWindowHTML.style.display = "none";
    settingsOverlayHTML.style.display = "none";

    soundsON = soundsCheckBoxHTML.checked; storage.save("options-sounds", soundsCheckBoxHTML.checked);
    autograbON = autograbCheckBoxHTML.checked; storage.save("options-autograb", autograbCheckBoxHTML.checked);
    emptyIndicationON = emptyIndicationCheckBoxHTML.checked; storage.save("options-empty-indication", emptyIndicationCheckBoxHTML.checked);

    if (autograbON && board.currentTile && !board.currentTile.dropped) board.currentTile.grab();

    settingsOpen = false;

    if (soundsON) soundManager.play("click");
}; document.addEventListener("mousedown", (e) => {if(!settingsWindowHTML.contains(e.target) && settingsOpen) closeSettings()});
