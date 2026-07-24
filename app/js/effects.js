function applyGain(buffer, gain) {
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] *= gain;
    }
}
