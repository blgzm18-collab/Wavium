const audioCtx = new AudioContext();
let audioBuffer = null;

async function loadAudio(file) {
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}
