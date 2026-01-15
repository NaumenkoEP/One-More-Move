class BoardManager {
    constructor(){
        this.i = 0;
        this.width = size;
        this.height = size;

        this.dimentions = 5;
        this.borderWidth = 5;

        this.holderGrid;
        this.holderId;
        
        this.tileBorderRadius = 5;
        this.tileSize = (this.width - (this.dimentions + 1) * this.borderWidth) / this.dimentions;

        this.tileGrid;

        this.currentValue;
        this.nextValue;
        this.previewTile = null;
        
        this.fontFamily = 'Sans-Serif';
        this.previewTileSize = 25;
        this.bgColor = '#F7F7FC'

        this.wildCardAnimationInterval;

        this.score;
        this.scoreContainerHTML = document.querySelector('.score-container');
        this.isAddingScore = true;

        this.fontSize = 50;
        
        this.bestScore;
        this.isBestScoreAdding;
        this.bestScoreCounterHTML = document.querySelector('.high-score-counter');
        this.bestScoreIconHTML = document.querySelector(".crown-icon");
        this.isNewBestScoreShown = false;

        this.pulseStartTime = performance.now();
        this.pulsePhaseOffset = 0;

        this.combo;
        this.allowedFailure = 3;
        this.failures;
        this.comboFactor = 1;
    }

    initHolderGrid() {
        for (let row = 0; row < this.dimentions; row++) {
            this.holderGrid[row] = [];
            for (let col = 0; col < this.dimentions; col++) {
                const x = this.borderWidth + col * (this.tileSize + this.borderWidth);
                const y = this.borderWidth + row * (this.tileSize + this.borderWidth);

                const holder = new BoardManager.TileHolder(this, x, y);

                this.holderGrid[row][col] = holder ;
            }
        }

        for (let row of this.holderGrid) {
            for (let holder of row) {
                holder.draw();
            }
        }
    }
    initTileGrid() {
        const saved = storage.tileGrid;

        if (saved !== null) {
            for (let row = 0; row < this.dimentions; row++) {
                for (let col = 0; col < this.dimentions; col++) {
                    const value = saved[row][col];

                    if (value === 0) {
                        this.tileGrid[row][col] = 0;
                        this.holderGrid[row][col].empty = true;
                        continue;
                    }

                    const holder = this.holderGrid[row][col];

                    const tile = new Tile(
                        String(value),
                        holder.x,
                        holder.y,
                        gc  
                    );

                    tile.dropped = true;    
                    tile.hoveredHolder = holder;
                    tile.coordinates = { row, col };
                    tile.id = holder.id;

                    holder.empty = false;

                    this.tileGrid[row][col] = tile;

                    tile.draw(true);
                }
            }
            return;
        }

        for (let row = 0; row < this.dimentions; row++) {
            this.tileGrid[row] = [];
            for (let col = 0; col < this.dimentions; col++) {
                this.tileGrid[row][col] = 0;
                this.holderGrid[row][col].empty = true;
            }
        }
    }

    initialise(){
        this.tileGrid = Array.from({ length: this.dimentions }, () =>
            Array(this.dimentions).fill(0)
        );

        this.holderGrid = [];
        this.holderId = 0;

        this.initHolderGrid();
        this.initTileGrid(); 

        const currrentValue = storage.currentValue;
        if(currrentValue !== null) this.currentValue = String(currrentValue);
        else this.currentValue = "1";

        const nextValue = storage.nextValue;
        if(nextValue !== null) this.nextValue = String(nextValue);
        else this.nextValue = "1";

        this.createPreviewTile(this.currentValue);
        this.displayNextTile(this.nextValue);

        const savedScore = storage.score;
        if (savedScore !== null && savedScore > 0) {
            this.score = 0;
            this.renderScore(0, this.fontSize);
            this.addScore(savedScore);          
        } else {
            this.score = 0;
            this.renderScore(0, this.fontSize);
        }

        const bestScore = storage.bestScore;
        if(bestScore !== null) this.bestScore = bestScore;
        else this.bestScore = 0;
        this.bestScoreCounterHTML.innerHTML = this.bestScore;

        const isBestScoreAdding = storage.isBestScoreAdding;
        if(isBestScoreAdding !== null) this.isBestScoreAdding = isBestScoreAdding;
        else this.isBestScoreAdding = false;

        const combo = storage.combo;
        if(combo !== null) this.combo = combo;
        else this.combo = 0;
        
        const failures = storage.failures;
        if(failures !== null) this.failures = failures;
        else this.failures = 0;
    }
    reset() {
        for(let row = 0; row < this.dimentions; row++){
            for(let col = 0; col < this.dimentions; col++){
                const tile = this.tileGrid[row][col];
                if(tile !== 0) this.tileGrid[row][col].destroy();
            }
        }
        const consumables = [
            "score",
            "is-best-score-adding",
            "combo",
            "failures",
            "tile-grid",
            "current-value",
            "next-value"
        ];
        for(let i = 0; i < consumables.length; i++){
            storage.nullify(consumables[i]);
        }

        this.tileGrid = Array.from({ length: this.dimentions }, () =>
            Array(this.dimentions).fill(0)
        );

        this.holderGrid = [];
        this.holderId = 0;
        this.initHolderGrid();

        this.currentValue = "1";
        this.nextValue = "1";

        storage.save("current-value", this.currentValue);
        storage.save("next-value", this.nextValue);

        tc.clearRect(0, 0, tileCanvas.width, tileCanvas.height);

        this.createPreviewTile(this.currentValue);
        this.displayNextTile(String(this.nextValue));

        this.combo = 0;
        this.score = 0;
        this.isBestScoreAdding = false;
        this.bestScoreIconHTML.src = "assets/crown-icon.png";
        this.bestScoreCounterHTML.style.color = "#6E6E73";
        this.isNewBestScoreShown = false;
        this.renderScore(0, this.fontSize);

        isGameOver = false;
    } 
    gameOverFadeOut(){
        const center = (this.dimentions - 1) / 2;

        const tiles = [];

        for (let r = 0; r < this.dimentions; r++) {
            for (let c = 0; c < this.dimentions; c++) {
                const tile = this.tileGrid[r][c];
                if (tile !== 0) {
                    const dist = Math.hypot(r - center, c - center);
                    tiles.push({ tile, dist });
                }
            }
        }

        tiles
            .sort((a, b) => a.dist - b.dist)
            .forEach(({ tile }, i) => {
                setTimeout(() => tile.fadeOutAnimation(), i * 50);
            });
    }

    getHighestValue(){
        const values = new Set();

        for (let row = 0; row < this.dimentions; row++) {
            for (let col = 0; col < this.dimentions; col++) {
                const cell = this.tileGrid[row][col];
                if (cell !== 0) {
                    values.add(Number(cell.value));
                }
            }
        }

        const highestValue = Math.max(...values);

        return highestValue;
    }
    getEmptyCells(){
        let emptyCells = 0;

        for (let row = 0; row < this.dimentions; row++) {
            for (let col = 0; col < this.dimentions; col++) {
                const cell = this.tileGrid[row][col];
                if (cell === 0) {
                    emptyCells++;
                }
            }
        }
        return emptyCells;
    }
    getTileValue() {        
        const highest = Math.max(1, this.getHighestValue());
        const empty = this.getEmptyCells();
        const size = this.dimentions * this.dimentions;

        const fullness = 1 - empty / size;  
        const difficulty = Math.min(1,
            (highest / 10) * 0.6 +
            fullness * 0.4
        );

        if(highest > 3){
            const specialChance = 0.01 + difficulty * 0.02; // 1% → 3%
            if (Math.random() < specialChance) {
                if (soundsON) soundManager.loop("wildcard");
                return "?";
            }
        }

       
        let weights = [1, 0.9, 0.7, 0.45, 0.22, 0.12, 0.05];

        weights = weights.map((w, i) => {
            const value = i + 1;

            if (value > highest + 2) return 0;

            let lowDecay = 1;
            if (value <= 3) {
                lowDecay = Math.max(
                    0.15,
                    1 - difficulty * 0.85
                );
            }

            const diffBoost = difficulty * value * 0.02;

            return Math.max(0, w * lowDecay + diffBoost);
        });


        if (empty <= 2 && highest >= 7) {
            weights = weights.map((w, i) => {
                const value = i + 1;

                if (value <= highest) return w * 1.6;

                return w;
            });
        }

        let total = weights.reduce((a, b) => a + b, 0);
        if (total <= 0 || !isFinite(total)) {
            weights = [1, 0.8, 0.5, 0.3, 0.12, 0.06, 0.03];
            total = weights.reduce((a, b) => a + b, 0);
        }

        let p = Math.random() * total;

        for (let i = 0; i < weights.length; i++) {
            if (p < weights[i]) return i + 1;
            p -= weights[i];
        }

        console.log("absolute fallback")
        return 1; 
    }

    createPreviewTile(value) {
        if (this.previewTile) {
            this.previewTile.destroy();
            this.previewTile = null;
        }

        this.previewTile = new Tile(
            String(value),
            tileCanvas.width / 2 - this.tileSize / 2,
            this.previewTileSize / 2,
            tc
        );

         if (autograbON) {
            // defer one frame to avoid race conditions
            requestAnimationFrame(() => {
                if (this.previewTile && !this.previewTile.dropped) {
                    this.previewTile.grab();
                }
            });
        }
    }
    displayTiles(){
        this.currentValue = this.nextValue;
        storage.save("current-value", this.currentValue);
         
        clearInterval(this.wildCardAnimationInterval);

        this.createPreviewTile(this.currentValue);

        this.nextValue = String(this.getTileValue());
        storage.save("next-value", this.nextValue);
        this.displayNextTile(this.nextValue);
    }
    displayNextTile(value){
        const tileX = tileCanvas.width / 2 + this.tileSize / 2 + 10;
        const tileY = 0;
        const tileSize = this.previewTileSize;
        const tileRad = 2;
        const fontSize = this.previewTileSize / 2;

        tc.clearRect(tileX, tileY, tileSize, tileSize);

        tc.fillStyle = Tile.getColor(value);
        tc.beginPath();
        tc.roundRect(tileX, tileY, tileSize, tileSize, tileRad);
        tc.fill();

        if(Number(value) >= 19) tc.fillStyle = "#F1F5FF"
        else tc.fillStyle = "black";
        tc.font = `bold ${fontSize}px ${this.fontFamily}`;
        tc.textAlign = "center";      
        tc.textBaseline = "middle"; 
        tc.fillText(value, tileX + tileSize / 2, tileSize / 2);

        if(value === "?"){
            let counter = 0;
            const values = [];
            const highestValue = this.getHighestValue();
            for(let i = 1; i < highestValue; i++) values.push(i);

            this.wildCardAnimationInterval = setInterval(() => {
                tc.clearRect(tileX, tileY, tileSize, tileSize);

                tc.fillStyle = Tile.getColor(String(values[counter]));
                tc.beginPath();
                tc.roundRect(tileX, tileY, tileSize, tileSize, tileRad);
                tc.fill();

                tc.fillStyle = "black";
                tc.font = `bold ${fontSize}px ${this.fontFamily}`;
                tc.textAlign = "center";      
                tc.textBaseline = "middle"; 
                tc.fillText(value, tileX + tileSize / 2, tileSize / 2);

                if(counter > values.length - 2) counter = 0;
                else counter++;

            }, 100)
        }
    }

    addScore(amount) {
        this.isAddingScore = true;
        
        const start = this.score;
        const end = this.score + amount;

        if(end >= this.bestScore) {
            this.isBestScoreAdding = true;
            storage.save("is-best-score-adding", this.isBestScoreAdding);

            if(!this.isNewBestScoreShown){
                gameOverContainerHTML.classList.remove("show");
                gameOverContainerHTML.innerHTML = "New High Score";
                gameOverContainerHTML.style.fontSize = "45px";
                void gameOverContainerHTML.offsetWidth; // restart animation
                gameOverContainerHTML.classList.add("show");

                this.isNewBestScoreShown = true;
            }
            
            this.bestScore = end;
            storage.save("best-score", this.bestScore);
            
            this.bestScoreCounterHTML.innerHTML = this.bestScore;

            if (amount <= 5) {
                this.bestScoreCounterHTML.innerHTML = end;
            } else {
                const duration = 600;
                const startTime = performance.now();
    
                const animate = (now) => {
                    const progress = Math.min(1, (now - startTime) / duration);
                    const eased = progress * (2 - progress);
    
                    const currentShown = Math.floor(start + (end - start) * eased);
                    this.bestScoreCounterHTML.innerHTML = currentShown;
            
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        this.bestScoreCounterHTML.innerHTML = end;
    
                        this.pulseStartTime = performance.now();
                        this.pulsePhaseOffset = Math.PI / 2;
                    }
    
                };
                
                requestAnimationFrame(animate);
            }
        }

        if (amount <= 5) {
            sc.fillStyle = this.bgColor;
            sc.fillRect(0, 0, size, this.tileSize);
            
            this.score = end;
            storage.save("score", this.score);
            this.renderScore(end, this.fontSize);
            
            this.isAddingScore = false;
            return;
        }

        const duration = 600;
        const startTime = performance.now();

        this.score = end;
        storage.save("score", this.score);

        const animate = (now) => {
            const progress = Math.min(1, (now - startTime) / duration);
            const eased = progress * (2 - progress);

            const currentShown = Math.floor(start + (end - start) * eased);
            this.renderScore(currentShown, this.fontSize)
    
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.renderScore(end, this.fontSize)

                this.pulseStartTime = performance.now();
                this.pulsePhaseOffset = Math.PI / 2;

                this.isAddingScore = false;
            }

        };
        
        requestAnimationFrame(animate);
    }

    getScorePulseSpeed(){
        const minSpeed = 0.003;
        const maxSpeed = 0.01;
        const comboCap = 50;

        const t = Math.min(this.combo, comboCap) / comboCap;
        const curved = t * t;

        const speed = minSpeed + curved * (maxSpeed - minSpeed);
        return speed;

    }
    scorePulseAnmiation() {
        const center = (this.maxFontSize + this.minFontSize) / 2;
        const amplitude = (this.maxFontSize - this.minFontSize) / 2;

        const animate = (now) => {
            if(!this.isAddingScore){
                const t = (now - this.pulseStartTime) * this.getScorePulseSpeed() + this.pulsePhaseOffset;
    
                if(this.score > 100) this.fontSize = center + Math.sin(t) * amplitude;
                this.renderScore(this.score, this.fontSize);
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    renderScore(value, fontSize){

        sc.fillStyle = this.bgColor;
        sc.fillRect(0, 0, size, this.tileSize + 20);

        if(this.combo > 1) this.renderComboCircle();

        sc.beginPath();

        sc.font = `${fontSize}px ${this.fontFamily}`;
        sc.textAlign = "center";      
        sc.textBaseline = "middle"; 

        sc.fillStyle = "black"; 
        sc.fillText(value, size / 2, this.tileSize - 25);
    }
    renderComboCircle(){

        const x = size / 2;
        const y = this.tileSize - 25;

        const baseColor = Tile.getColor(String(Math.ceil(Math.min(board.combo / 5, 12))));
        const radius = 35;

        const gradient = sc.createRadialGradient(
            x, y, 0,      
            x, y, radius  
        );

        gradient.addColorStop(0.0, baseColor);
        gradient.addColorStop(0.2, baseColor);

        gradient.addColorStop(0.45, baseColor + "CC");
        gradient.addColorStop(0.65, baseColor + "88");
        gradient.addColorStop(0.8,  baseColor + "44");
        gradient.addColorStop(1.0,  baseColor + "00");

        sc.fillStyle = gradient;
        sc.beginPath();
        sc.arc(x, y, radius, 0, Math.PI * 2, false);
        sc.fill();
    }
    updateCombo(comboCount){
        this.combo += comboCount

        this.comboFactor = 1 + this.combo * 0.15; 
        storage.save("combo", this.combo);
    }
    nulifyCombo(){
        this.combo = 0;
        this.updateCombo(0);

        this.failures = 0;
        storage.save("failures", this.failures);
    }
    
    grantWildCard(){
        this.currentValue = "?";
        storage.save("current-value", this.currentValue);
        this.createPreviewTile(this.currentValue);
    }

    // TODO WITH SDK
    requestWildCard(){
        let granted = true;
        if(granted) this.grantWildCard();
        else console.log("no tile for you");

        closeSettings();
    }

    static TileHolder = class {
        constructor(parent, x, y){
            this.parent = parent;

            this.x = x;
            this.y = y;

            this.width = this.parent.tileSize;
            this.height = this.parent.tileSize;

            this.color = "#FFFFFF";

            this.id = parent.holderId++;

            this.empty = true;
        }

        draw() {
            gc.clearRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);

            gc.fillStyle = this.color;
            gc.beginPath();
            gc.roundRect(
                this.x,
                this.y,
                this.width,
                this.height,
                this.parent.tileBorderRadius
            );
            gc.fill();
        }


        contains(x, y) {
            return (
                x >= this.x &&
                x <= this.x + this.width &&
                y >= this.y &&
                y <= this.y + this.height
            );
        }

        indicateEmpty(){
            gc.fillStyle = "#E4E6F1";
            gc.beginPath();
            gc.arc(this.x + this.width / 2, this.y + this.height / 2, 5, 0, Math.PI * 2, false);
            gc.fill();
        }
    }
}
