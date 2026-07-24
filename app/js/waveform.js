function drawWaveform(buffer) {
    const canvas = document.getElementById("canvas");
    const c = canvas.getContext("2d");

    const data = buffer.getChannelData(0);
    const step = Math.floor(data.length / canvas.width);
    const amp = canvas.height / 2;

    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.moveTo(0, amp);

    for (let i = 0; i < canvas.width; i++) {
        const value = data[i * step];
        c.lineTo(i, amp + value * amp);
    }

    c.strokeStyle = "#4af";
    c.stroke();
}
