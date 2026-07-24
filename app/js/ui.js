// ui.js
import { loadAudio, audioCtx, setAudioBuffer } from './audioLoader.js';
import { drawWaveform, setPlayhead } from './waveform.js';
import { applyGain, fadeIn, fadeOut, normalize } from './effects.js';
import { exportWav } from './exporter.js';

let sourceNode = null;
let rafId = null;
let startTime = 0;
let pausedAt = 0;
let isPlaying = false;
let currentBuffer = null;

const fileInput = document.getElementById('fileInput');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const gainSlider = document.getElementById('gainSlider');
const applyGainBtn = document.getElementById('applyGainBtn');
const fadeInBtn = document.getElementById('fadeInBtn');
const fadeOutBtn = document.getElementById('fadeOutBtn');
const fadeInInput = document.getElementById('fadeInInput');
const fadeOutInput = document.getElementById('fadeOutInput');
const normalizeBtn = document.getElementById('normalizeBtn');
const exportBtn = document.getElementById('exportBtn');
const status = document.getElementById('status');
const fileName = document.getElementById('fileName');
const fileInfo = document.getElementById('fileInfo');
const timeInfo = document.getElementById('timeInfo');
const sampleRateEl = document.getElementById('sampleRate');

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  status.textContent = 'Loading...';
  const buf = await loadAudio(file);
  currentBuffer = buf;
  setAudioBuffer(buf);
  drawWaveform(buf);
  fileName.textContent = file.name;
  fileInfo.textContent = `${(buf.length / buf.sampleRate).toFixed(2)}s • ${buf.numberOfChannels}ch`;
  sampleRateEl.textContent = `${buf.sampleRate} Hz`;
  timeInfo.textContent = `00:00 / ${formatTime(buf.length / buf.sampleRate)}`;
  status.textContent = 'Ready';
};

function formatTime(sec) {
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function stopPlayback() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (rafId) cancelAnimationFrame(rafId);
  isPlaying = false;
  pausedAt = 0;
  setPlayhead(0);
  status.textContent = 'Stopped';
}

function startPlayback(offset = 0) {
  if (!currentBuffer) return;
  stopPlayback();
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = currentBuffer;
  sourceNode.connect(audioCtx.destination);
  startTime = audioCtx.currentTime - offset;
  sourceNode.start(0, offset);
  isPlaying = true;
  status.textContent = 'Playing';
  animatePlayhead();
  sourceNode.onended = () => {
    stopPlayback();
  };
}

function animatePlayhead() {
  if (!currentBuffer) return;
  const duration = currentBuffer.length / currentBuffer.sampleRate;
  const pos = (audioCtx.currentTime - startTime) / duration;
  setPlayhead(Math.max(0, Math.min(1, pos)));
  timeInfo.textContent = `${formatTime((audioCtx.currentTime - startTime))} / ${formatTime(duration)}`;
  if (isPlaying) rafId = requestAnimationFrame(animatePlayhead);
}

playBtn.onclick = async () => {
  if (!currentBuffer) return;
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  if (!isPlaying) {
    startPlayback(0);
  } else {
    // already playing -> restart
    stopPlayback();
    startPlayback(0);
  }
};

stopBtn.onclick = () => {
  stopPlayback();
};

applyGainBtn.onclick = () => {
  const val = Number(gainSlider.value);
  const out = applyGain(val);
  if (out) {
    currentBuffer = out;
    setAudioBuffer(out);
    status.textContent = `Applied gain ${val}%`;
    timeInfo.textContent = `00:00 / ${formatTime(currentBuffer.length / currentBuffer.sampleRate)}`;
  }
};

fadeInBtn.onclick = () => {
  const seconds = parseFloat(fadeInInput.value) || 0;
  const out = fadeIn(seconds);
  if (out) {
    currentBuffer = out;
    setAudioBuffer(out);
    status.textContent = `Fade in ${seconds}s applied`;
  }
};

fadeOutBtn.onclick = () => {
  const seconds = parseFloat(fadeOutInput.value) || 0;
  const out = fadeOut(seconds);
  if (out) {
    currentBuffer = out;
    setAudioBuffer(out);
    status.textContent = `Fade out ${seconds}s applied`;
  }
};

normalizeBtn.onclick = () => {
  const out = normalize();
  if (out) {
    currentBuffer = out;
    setAudioBuffer(out);
    status.textContent = 'Normalized';
  }
};

exportBtn.onclick = () => {
  exportWav();
  status.textContent = 'Export started';
};
