// luckytile rewarded 
// revive rewarded 
// game over interstitial 
// restart interstitial 
class AdManager {
    constructor( ) {
        this.maxAdsPerSession = 4;
        this.sessionAds;
        this.minGamesBeforeAds = 1;
        this.gamesPlayed;
        this.gamesBetweenAds = 2;
        this.lastAdGame;
        this.resetSession();
    }

    resetSession() {
        this.gamesPlayed = 0;
        this.lastAdGame = -Infinity;
        this.sessionAds = 0;
    }
    onGameStart() {
        // TODO WITH SDK
    }
    onGameOver(reviveUsed) {
        this.gamesPlayed++;
        if (this.shouldShowInterstitial(reviveUsed)) {
            this.showInterstitial();
            this.lastAdGame = this.gamesPlayed;
            this.sessionAds++;
        }
    }
    shouldShowInterstitial(reviveUsed) {
        if (this.sessionAds >= this.maxAdsPerSession) return false;
        if (this.gamesPlayed < this.minGamesBeforeAds) return false;
        if (!reviveUsed) return true;
        const gamesSinceLastAd = this.gamesPlayed - this.lastAdGame;
        if (gamesSinceLastAd >= this.gamesBetweenAds) return true;
        return false;
    }
    // TODO WITH SDK
    showInterstitial() {
        console.log("Showing interstitial ad");
    }
    // TODO WITH SDK
    showRewardedAd({ onSuccess, onFail } = {}) {
        console.log("Showing rewarded ad");
    }
}
