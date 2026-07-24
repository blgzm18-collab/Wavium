document.getElementById("fileInput").onchange = async (e) => {
    const file = e.target.files[0];
    const buffer = await loadAudio(file);
    drawWaveform(buffer);
};

document.getElementById("playBtn").onclick = () => {
    if (!audioBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(audioCtx.destination);
    src.start();
};
