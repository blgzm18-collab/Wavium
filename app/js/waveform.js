// waveform.js
import { audioBuffer } from './audioLoader.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);

export function drawWaveform(buffer) {
  if (!buffer) return;
  resizeCanvas();
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / w));
  const amp = h / 2;

  ctx.clearRect(0, 0, w, h);

  // background grid
  ctx.fillStyle = '#07080a';
  ctx.fillRect(0, 0, w, h);

  // center line
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineTo(w, amp);
  ctx.stroke();

  // waveform
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#4ad3ff';

  for (let i = 0; i < w; i++) {
    const sample = data[i * step] || 0;
    ctx.lineTo(i, amp + sample * amp);
  }
  ctx.stroke();

  // subtle fill
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#4ad3ff';
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function setPlayhead(percent) {
  const playhead = document.getElementById('playhead');
  const clamped = Math.max(0, Math.min(100, percent * 100));
  playhead.style.left = clamped + '%';
  const progress = document.getElementById('progress');
  progress.style.width = clamped + '%';
}
