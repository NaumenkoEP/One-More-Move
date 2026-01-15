class Tile {
    constructor(value, x, y, ctx){
        this.value = value;

        this.isWildCard;
        if(this.value === "?") this.isWildCard = true;
        else this.isWildCard = false;
        if (this.isWildCard) {
            soundManager.stop("wildcard");
            soundManager.loop("wildcard", {playbackRate: 0.3});
        }

        this.id;
        this.coordinates;

        this.color = Tile.getColor(this.value);

        this.x = x;
        this.y = y;

        this.width = board.tileSize;
        this.height = board.tileSize;
        this.radius = board.tileBorderRadius;

        this.appearAnimationInterval;
        this.wildCardAnimationInterval;

        this.ctx = ctx;

        this.dropped = false;

        this.fontSize = 47;
        this.fontFamily = board.fontFamily;
        
        this._grabListener = (e) => {
            const rect = tileCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (this.contains(mouseX, mouseY)) {
                this.grab();
            }
        }; 
        
        if (this.ctx === tc) {
            tileCanvas.addEventListener("click", this._grabListener);
        }


        this.hoveredHolder;
        this._dropListener = (e) => {
            for (let row of board.holderGrid) {
                for (let holder of row) {
                    const rect = gameCanvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    if(holder.empty){
                        if(holder.contains(mouseX, mouseY)) {
                            holder.empty = false;
                            this.hoveredHolder = holder;
                            this.drop();
                        }   
                    }
                }
            }
        }

        this.display(true);
    }
    // static getColor(value){
    //     let color;
    //     switch(value) {
    //         case "1": color = "#BEE3F8"; break;
    //         case "2": color = "#B4F1CC"; break;
    //         case "3": color = "#9BE7E0"; break;
    //         case "4": color = "#FBC4AB"; break;
    //         case "5": color = "#FFDF8F"; break;
    //         case "6": color = "#FF9E8F"; break;
    //         case "7": color = "#F7A1D4"; break;
    //         case "8": color = "#FF4F8B"; break;
    //         case "9": color = "#A06BFF"; break;
    //         case "10": color = "#FFD43B"; break;
    //         case "?": color = "yellow"; break;
    //         default: color = "blue";
    //     }
    //     return color;
    // }

    static getColor(value){
        let color;
        switch(value) {

            // Cool / Early (Blue)
            case "1":  color = "#DCE6F2"; break;
            case "2":  color = "#BFD7EA"; break;
            case "3":  color = "#99C1DE"; break;

            // Warm / Mid (Cream / Peach)
            case "4":  color = "#F6E3C5"; break;
            case "5":  color = "#F5C396"; break;
            case "6":  color = "#F29E85"; break;

            // Red escalation (Bright / energetic)
            case "7":  color = "#FF8A8A"; break;
            case "8":  color = "#FF5F5F"; break;
            case "9":  color = "#FF3D3D"; break;

            // Purple accent (new phase)
            case "10": color = "#E4DCFF"; break;
            case "11": color = "#C2B2FF"; break;
            case "12": color = "#9D84FF"; break;

            // Teal / Mint (clarity & relief)
            case "13": color = "#D6F4EE"; break;
            case "14": color = "#9FE6D6"; break;
            case "15": color = "#4FC9B0"; break;

            // Gold / Amber (reward tier — no cream overlap)
            case "16": color = "#FFE29A"; break;
            case "17": color = "#FFC857"; break;
            case "18": color = "#F4A300"; break;

            // Obsidian (endgame, no bright red overlap)
            case "19": color = "#2F3A56"; break;
            case "20": color = "#1F2A44"; break;
            case "21": color = "#0E1628"; break;

            // Special
            case "?":  color = "#FFC857"; break;

            default: color = "#0E1628";
        }
        return color;
    }

    draw(drawNumber){
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;

        this.ctx.roundRect(this.x, this.y, this.width, this.height, this.radius);
        this.ctx.fill();

        if(drawNumber){
            this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            this.ctx.textAlign = "center";      
            this.ctx.textBaseline = "middle"; 
            
            if(Number(this.value) >= 19) this.ctx.fillStyle = "#F1F5FF"
            else this.ctx.fillStyle = "black";
            this.ctx.fillText(
                this.value,
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }
    }
    wildCardAnimation(){
        let counter = 0;
        const values = [];
        const highestValue = board.getHighestValue();
        for(let i = 1; i < highestValue; i++) values.push(i);
        

        const displayValue = String(values[counter]);
        this.value = displayValue;
        this.color = Tile.getColor(displayValue);
        this.draw(true);
        counter++;

        this.wildCardAnimationInterval = setInterval(() => {
            if(!this.dropped){
                tc.clearRect(tileCanvas.width / 2 - board.tileSize / 2 - 1, board.previewTileSize / 2 - 1, board.tileSize + 2, board.tileSize + 2);

                this.ctx = tc;
                const displayValue = String(values[counter]);
    
                this.value = displayValue;
                this.color = Tile.getColor(displayValue);
    
    
                this.draw(true);
    
                if(counter > values.length - 2) counter = 0;
                else counter++;

            } else {
                this.ctx = gc;
                clearInterval(this.wildCardAnimationInterval);
            }

        }, 450);
    }
    appearAnimation() {
        let w = 0;
        let h = 0;

        const target = board.tileSize;
        const growthSpeed = isMobile ? 10 : target / 8;

        const animate = () => {
            w += growthSpeed;
            h += growthSpeed;

            if (w >= target) w = target;
            if (h >= target) h = target;

            this.width = w;
            this.height = h;
            this.x = this.hoveredHolder.x + (target - w) / 2;
            this.y = this.hoveredHolder.y + (target - h) / 2;

            this.draw(w === target);

            if (w < target || h < target) {
                requestAnimationFrame(animate);
            } else {
                this.width = target;
                this.height = target;
                this.x = this.hoveredHolder.x;
                this.y = this.hoveredHolder.y;
                this.draw(true);
            }
        };

        requestAnimationFrame(animate);

    }
    fadeOutAnimation() {
        let w = board.tileSize;
        let h = board.tileSize;

        const target = 0;
        // const speed = isMobile ? 8 : 12;
        const speed = 2;

        const cx = this.hoveredHolder.x + board.tileSize / 2;
        const cy = this.hoveredHolder.y + board.tileSize / 2;


        const animate = () => {
            this.hoveredHolder.draw();

            w -= speed;
            h -= speed;
            this.fontSize -= speed / 2;

            if (w <= target) w = target;
            if (h <= target) h = target;
            if (this.fontSize < 2) this.fontSize = 0;

            this.width = w;
            this.height = h;
            this.x = cx - w / 2;
            this.y = cy - h / 2;

            this.draw(false); // alternative true

            if (w > target || h > target) {
                requestAnimationFrame(animate);
            } else {
                this.hoveredHolder.draw(false);
            }
        };

        requestAnimationFrame(animate);
    }

    display(){
        if(this.value !== "?") this.draw(true);
        else this.wildCardAnimation();
    }

    contains(x, y) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }
    destroy() {
        tileCanvas.removeEventListener("click", this._grabListener);
        gameCanvas.removeEventListener("click", this._dropListener);
    }

    grab(){
        for (let row of board.holderGrid) {
            for (let holder of row) {
                if(holder.empty) holder.indicateEmpty();
            }
        }
        if(!autograbON) tileCanvas.removeEventListener("click", this._grabListener);
        gameCanvas.addEventListener("click", this._dropListener);
    }
    drop(){
        if(isGameOver) return;

        if (soundsON) {
            if (this.isWildCard) soundManager.stop("wildcard");
        } 
        
        this.dropped = true;

        this.x = this.hoveredHolder.x;
        this.y = this.hoveredHolder.y;
        this.ctx = gc;

        this.id = this.hoveredHolder.id;
        this.coordinates = {
            row: Math.floor(this.id / board.dimentions),
            col: this.id % board.dimentions
        };
        board.tileGrid[this.coordinates.row][this.coordinates.col] = this

        gameCanvas.removeEventListener("click", this._dropListener);
        tileCanvas.removeEventListener("click", this._grabListener);

        tc.clearRect(tileCanvas.width / 2 - board.tileSize / 2 - 1, board.previewTileSize / 2 - 1, board.tileSize + 2, board.tileSize + 2);

        board.addScore(Number(this.value));

        this.appearAnimation();
        this.checkForMerge();

        for (let row of board.holderGrid) for (let holder of row) if(holder.empty) holder.draw();
        
        setTimeout(() => {board.displayTiles()}, 200);
    }

    checkForMerge() {
        const { row, col } = this.coordinates;
        let mergeCount = 0;
        const neighbors = [];

        // above
        if (row > 0) {
            const tileAbove = board.tileGrid[row - 1][col];
            if (tileAbove && tileAbove.value === this.value) {
                neighbors.push({ r: row - 1, c: col });
                mergeCount++;
            }
        }

        // below
        if (row < board.dimentions - 1) {
            const tileBelow = board.tileGrid[row + 1][col];
            if (tileBelow && tileBelow.value === this.value) {
                neighbors.push({ r: row + 1, c: col });
                mergeCount++;
            }
        }

        // left
        if (col > 0) {
            const tileLeft = board.tileGrid[row][col - 1];
            if (tileLeft && tileLeft.value === this.value) {
                neighbors.push({ r: row, c: col - 1 });
                mergeCount++;
            }
        }

        // right
        if (col < board.dimentions - 1) {
            const tileRight = board.tileGrid[row][col + 1];
            if (tileRight && tileRight.value === this.value) {
                neighbors.push({ r: row, c: col + 1 });
                mergeCount++;
            }
        }

        // Save progress to storage
        const nonCircularValues = Array.from(
            { length: board.dimentions },
            () => Array(board.dimentions).fill(0)
        );

        for(let row = 0; row < board.dimentions; row++){
            for(let col = 0; col < board.dimentions; col++){
                const item = board.tileGrid[row][col]
                if(item !== 0) nonCircularValues[row][col] = item.value;
                else nonCircularValues[row][col] = 0;
            }
        }
        storage.save("tile-grid", nonCircularValues);
        
        if (mergeCount === 0) { 

            board.failures++;
            storage.save("failures", board.failures);
            
            if (board.failures > 3) board.nulifyCombo();

            if(board.getEmptyCells() < 1) gameOver();

            if (soundsON) soundManager.play("drop", {volume: 0.8});

            
            return;
        }

        board.failures = 0;
        storage.save("failures", 0);
        
        // Remove neighbors
        for (const n of neighbors) {
            const holder = board.holderGrid[n.r][n.c];
            board.tileGrid[n.r][n.c] = 0;
            holder.empty = true;
            holder.draw();
        }

        // Upgrade value
        this.value = String(Number(this.value) + mergeCount);

        const score = Math.floor(Number(((this.value * 2) * mergeCount)) * board.comboFactor);
        board.addScore(score);
        board.updateCombo(mergeCount);

        this.color = Tile.getColor(this.value);

        if(soundsON) soundManager.play("drop", {playbackRate: 1 + Math.min(board.combo * 0.03, 1.5), volume: 1 });


        // Recursive merge (after visual update)
        setTimeout(() => {
            this.checkForMerge();
        }, 20);
    }
}
