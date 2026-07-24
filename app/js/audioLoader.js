// audioLoader.js
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export let audioBuffer = null;

export async function loadAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  audioBuffer = decoded;
  return decoded;
}

export function setAudioBuffer(buf) {
  audioBuffer = buf;
}
