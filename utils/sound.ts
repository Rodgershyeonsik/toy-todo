let ctx: AudioContext | null = null;

export const playBeep = () => {
  if (!ctx) ctx = new AudioContext();

  [0, 0.6, 1.2].forEach((delay) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.connect(gain);
    gain.connect(ctx!.destination);
    osc.frequency.value = 880; // 음 높이 (Hz)
    osc.type = "sine";
    gain.gain.setValueAtTime(0.5, ctx!.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx!.currentTime + delay + 0.2
    );
    osc.start(ctx!.currentTime + delay);
    osc.stop(ctx!.currentTime + delay + 0.2);
  });
};
