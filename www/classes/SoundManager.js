class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.enabled = true;
        this.volume = 1;
        this.unlocked = false;
        this.activeLoops = {};
    }

    async unlock() {
        if (this.unlocked) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 44100
        });
        // 🔑 REAL unlock sound (required by iOS)
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);

        if (this.ctx.state !== "running") {
            await this.ctx.resume();
        }

        this.unlocked = this.ctx.state === "running";
    }

    async load(name, url) {
        if (!this.unlocked) return;
        
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

    loop(name, { volume = 1, playbackRate = 1 } = {}) {
        if (!this.enabled || !this.unlocked) return;
        if (this.activeLoops[name]) return;

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
