class Tile {
    constructor(value, x, y, ctx){
        this.value = value;

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

        this.fontSize = 40;
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
            case "1": color = "#DCE6F2"; break;
            case "2": color = "#BFD7EA"; break;
            case "3": color = "#99C1DE"; break;
            case "4": color = "#F6E3C5"; break;
            case "5": color = "#F5C396"; break;
            case "6": color = "#F29E85"; break;
            case "7": color = "#FF8080"; break;
            case "8": color = "#FF5757"; break;
            case "9": color = "#FF3B3B"; break;
            case "10": color = "#E00000"; break;
            case "?": color = "yellow"; break;
            default: color = "#E00000";
        }
        return color;
    }

    draw(drawNumber){
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;

        this.ctx.roundRect(this.x, this.y, this.width, this.height, this.radius);
        this.ctx.fill();

        if(drawNumber){
            this.ctx.font = `47px ${this.fontFamily}`;
            this.ctx.textAlign = "center";      
            this.ctx.textBaseline = "middle"; 
    
            this.ctx.fillStyle = "black";
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
                tc.fillStyle = board.bgColor;
                tc.fillRect(this.x, this.y, this.width, this.height);

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

        }, 500);
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

    grab(){
        for (let row of board.holderGrid) {
            for (let holder of row) {
                if(holder.empty) holder.indicateEmpty();
            }
        }
        tileCanvas.removeEventListener("click", this._grabListener);
        gameCanvas.addEventListener("click", this._dropListener);
        
    }
    drop(){
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

        tc.fillStyle = board.bgColor;
        tc.fillRect(tileCanvas.width / 2 - board.tileSize / 2 - 1, board.previewTileSize / 2 - 1, board.tileSize + 2, board.tileSize + 2);

        board.addScore(Number(this.value));

        this.appearAnimation();
        this.checkForMerge();

        for (let row of board.holderGrid) {
            for (let holder of row) {
                if(holder.empty) holder.draw();
            }
        } 

        setTimeout(()=> {
            board.displayTiles();
        }, 200)

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
        const nonCircularValues = [[], [], [], [], []];
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
        // const score = Math.floor( (Math.pow(Number(this.score), 2) * mergeCount) * board.comboFactor );
        board.addScore(score);
        board.updateCombo(mergeCount);

        this.color = Tile.getColor(this.value);

        // Recursive merge (after visual update)
        setTimeout(() => {
            this.checkForMerge();
        }, 20);
    }
}
