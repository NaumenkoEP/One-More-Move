class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.enabled = true;
        this.volume = 1;
        this.unlocked = false;

        this.activeLoops = {}; // 🔑 track looping sounds
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

    // 🔁 LOOPING SOUND
    loop(name, { volume = 1, playbackRate = 1 } = {}) {
        if (!this.enabled || !this.unlocked) return;
        if (this.activeLoops[name]) return; // already looping

        const buffer = this.buffers[name];
        if (!buffer) return;

        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        src.buffer = buffer;
        src.loop = true;
        src.playbackRate.value = playbackRate;
        gain.gain.value = volume * this.volume;

        src.connect(gain);
        gain.connect(this.ctx.destination);

        src.start();

        this.activeLoops[name] = { src, gain };
    }

    // ⛔ STOP LOOP
    stop(name) {
        const loop = this.activeLoops[name];
        if (!loop) return;

        loop.src.stop();
        loop.src.disconnect();
        loop.gain.disconnect();

        delete this.activeLoops[name];
    }

    setEnabled(b) {
        this.enabled = b;
        if (!b) {
            Object.keys(this.activeLoops).forEach(k => this.stop(k));
        }
    }
}
