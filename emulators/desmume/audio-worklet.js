class MyAudioWorklet extends AudioWorkletProcessor {
    constructor() {
        super()
        this.FIFO_CAP = 5000
        this.fifo0 = new Int16Array(this.FIFO_CAP)
        this.fifo1 = new Int16Array(this.FIFO_CAP)
        this.fifoHead = 0
        this.fifoLen = 0
        this.port.onmessage = (e) => {
            //console.log(this.fifoLen)
            var buf = e.data
            var samplesReceived = buf.length / 2
            if (this.fifoLen + samplesReceived >= this.FIFO_CAP) {
                console.log('o')
                return
            }

            for (var i = 0; i < buf.length; i += 2) {
                this.fifoEnqueue(buf[i], buf[i + 1])
            }
        }
    }

    fifoDequeue() {
        this.fifoHead += 1
        this.fifoHead %= this.FIFO_CAP
        this.fifoLen -= 1
    }

    fifoEnqueue(a, b) {
        const pos = (this.fifoHead + this.fifoLen) % this.FIFO_CAP
        this.fifo0[pos] = a
        this.fifo1[pos] = b
        this.fifoLen += 1
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0]
        const chan0 = output[0]
        const chan1 = output[1]

        for (var i = 0; i < chan0.length; i++) {
            if (this.fifoLen < 1) {
                console.log("u")
                break
            }
            chan0[i] = this.fifo0[this.fifoHead] / 32768.0
            chan1[i] = this.fifo1[this.fifoHead] / 32768.0
            this.fifoDequeue()
        }
        return true
    }
}

registerProcessor('my-worklet', MyAudioWorklet)