
class AudioAnalyzer {
    constructor(source) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyzer = this.audioCtx.createAnalyser();
        this.audioSource = source;
        this.connectNewSource = this.connectNewSource.bind(this);

        this.source = undefined;
        this.data = undefined;
    }

    connectNewSource() {
        const source = this.audioSource;
        return new Promise((resolve, reject) => {
            // Set up audio input
            if (source instanceof HTMLElement) {
                this.source = this.audioCtx.createMediaElementSource(source);
                this.analyzer.connect(this.audioCtx.destination);
            } else {
                this.source = this.audioCtx.createMediaStreamSource(source);
            }
            // Pass data through analyzer
            this.source.connect(this.analyzer);
            resolve(true);
        })
    }

    collectData(size = 2048, type = 'b') {
        this.analyzer.fftSize = size;
        let bufferLength = this.analyzer.frequencyBinCount;
        this.data = type === 'b' ? new Uint8Array(bufferLength) : new Float32Array(bufferLength);
        if (type === 'b') this.analyzer.getByteFrequencyData(this.data);
        else this.analyzer.getFloatFrequencyData(this.data);
        return this.getData();
    }

    updateSource(src) {
        this.audioSource = src;
    }
    getData() {
        return this.data;
    }
}
class RoundBarVisualizer {
    constructor(canvas, audioAnalyzer) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.audioAnalyzer = audioAnalyzer;
        this.draw = this.draw.bind(this);
        this.drawVisual = undefined;
    }

    draw() {
        this.ctx.save();;
        let data = this.audioAnalyzer.collectData(256);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillStyle = 'rgb(61,61,61)';
        let barWidth = this.canvas.width / this.audioAnalyzer.analyzer.frequencyBinCount,
            barHeight;
        let angle = 0;
        for (let i = 0; i < this.audioAnalyzer.analyzer.frequencyBinCount; ++i) {
            barHeight = this.map(data[i], 0, this.canvas.height / 1.5, 0, 255);
            this.ctx.fillStyle = `rgb(20, ${Math.min(data[i] / 2 + 100, 254)}, 133)`;

            const rotate = angle + Math.PI / 2;
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            this.ctx.rotate(rotate);
            this.ctx.fillRect(0, 0, barWidth, barHeight);
            this.ctx.rotate(-rotate);
            angle += (2.05 * Math.PI) / this.audioAnalyzer.analyzer.frequencyBinCount
            // this.ctx.rotate((Math.PI / 180) * (390 / this.audioAnalyzer.analyzer.frequencyBinCount));
        }
        this.ctx.restore();
        this.drawVisual = requestAnimationFrame(this.draw);
    }
    map(val, newMin, newMax, oldMin, oldMax) {
        let p = (val - oldMin) / (oldMax - oldMin);
        let v = (newMax - newMin) * p;
        return v + newMin;
    }
}
