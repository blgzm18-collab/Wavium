// effects.js
import { audioBuffer, setAudioBuffer } from './audioLoader.js';
import { drawWaveform } from './waveform.js';

function cloneBuffer(buf) {
  const channels = buf.numberOfChannels;
  const newBuf = new AudioBuffer({
    length: buf.length,
    numberOfChannels: channels,
    sampleRate: buf.sampleRate
  });
  for (let c = 0; c < channels; c++) {
    newBuf.copyToChannel(buf.getChannelData(c), c);
  }
  return newBuf;
}

export function applyGain(gainPercent) {
  if (!audioBuffer) return null;
  const gain = gainPercent / 100;
  const out = cloneBuffer(audioBuffer);
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const data = out.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] *= gain;
  }
  setAudioBuffer(out);
  drawWaveform(out);
  return out;
}

export function fadeIn(seconds) {
  if (!audioBuffer) return null;
  const out = cloneBuffer(audioBuffer);
  const sr = out.sampleRate;
  const fadeSamples = Math.min(out.length, Math.floor(seconds * sr));
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const data = out.getChannelData(ch);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[i] *= t;
    }
  }
  setAudioBuffer(out);
  drawWaveform(out);
  return out;
}

export function fadeOut(seconds) {
  if (!audioBuffer) return null;
  const out = cloneBuffer(audioBuffer);
  const sr = out.sampleRate;
  const fadeSamples = Math.min(out.length, Math.floor(seconds * sr));
  const start = out.length - fadeSamples;
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const data = out.getChannelData(ch);
    for (let i = 0; i < fadeSamples; i++) {
      const t = 1 - (i / fadeSamples);
      data[start + i] *= t;
    }
  }
  setAudioBuffer(out);
  drawWaveform(out);
  return out;
}

export function normalize() {
  if (!audioBuffer) return null;
  const out = cloneBuffer(audioBuffer);
  let peak = 0;
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const data = out.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
  }
  if (peak === 0) return out;
  const gain = 1 / peak;
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const data = out.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] *= gain;
  }
  setAudioBuffer(out);
  drawWaveform(out);
  return out;
}
