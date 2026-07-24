// exporter.js
import { audioBuffer } from './audioLoader.js';

function interleaveChannels(buffer) {
  const channels = buffer.numberOfChannels;
  const length = buffer.length * channels;
  const result = new Float32Array(length);
  let index = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < channels; ch++) {
      result[index++] = buffer.getChannelData(ch)[i];
    }
  }
  return result;
}

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return view;
}

function writeWavHeader(view, sampleRate, numChannels, bytesLength) {
  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytesLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, bytesLength, true);
}

export function exportWav(filename = 'wavium-export.wav') {
  if (!audioBuffer) {
    alert('No audio loaded');
    return;
  }
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const interleaved = interleaveChannels(audioBuffer);
  const pcmView = floatTo16BitPCM(interleaved);
  const wavBuffer = new ArrayBuffer(44 + pcmView.byteLength);
  const view = new DataView(wavBuffer);
  writeWavHeader(view, sampleRate, numChannels, pcmView.byteLength);
  // copy PCM
  for (let i = 0; i < pcmView.byteLength; i++) {
    view.setUint8(44 + i, pcmView.getUint8(i));
  }
  const blob = new Blob([view], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
