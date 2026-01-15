class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.enabled = true;
        this.volume = 0.7;
        this.unlocked = false;
    }

    async init() {
        if (this.ctx) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        const unlock = () => {
            if (this.ctx.state !== "running") {
                this.ctx.resume();
            }
            this.unlocked = true;
            document.removeEventListener("pointerdown", unlock);
        };

        document.addEventListener("pointerdown", unlock);

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" &&
                this.ctx.state === "suspended") {
                this.ctx.resume();
            }
        });
    }


    async load(name, url) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(arrayBuffer);
    }

    play(name, { volume = 1, playbackRate = 1 } = {}) {
        if (!this.enabled || !this.unlocked) return;
        const buffer = this.buffers[name];
        if (!buffer) return;

        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        gain.gain.value = volume * this.volume;
        src.buffer = buffer;
        src.playbackRate.value = playbackRate;

        src.connect(gain);
        gain.connect(this.ctx.destination);

        src.start();
    }

    setEnabled(b) {
        this.enabled = b;
    }
}
