class MemoryManager {
    constructor(){
        this.score = this.get("score");
        this.bestScore = this.get("best-score");
        this.isBestScoreAdding = this.get("is-best-score-adding");

        this.combo = this.get("combo");
        this.failures = this.get("failures");

        this.tileGrid = this.get("tile-grid");

        this.currentValue = this.get("current-value");
        this.nextValue = this.get("next-value");

        this.options = {
            sounds: this.get("options-sounds"),
            autograb: this.get("options-autograb")
        };
    }
    save(key, value){
        if (value === undefined) return;
        
        localStorage.setItem(key, JSON.stringify(value));
    }
    get(key){
       const raw = localStorage.getItem(key);

       if (raw === null) return null;

        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }
    nullify(key){
        if (key === undefined) return;

        localStorage.removeItem(key);
    }
    clear(){
        localStorage.clear();
    }
}
