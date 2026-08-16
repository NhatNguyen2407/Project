import { useCallback } from 'react';

// Dùng chung 1 AudioContext cho cả app (tạo âm thanh bằng oscillator, không cần file mp3 nào)
let sharedCtx = null;
const getCtx = () => {
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null; // Trình duyệt không hỗ trợ Web Audio
    sharedCtx = new AudioCtx();
  }
  // Trình duyệt tự suspend AudioContext cho tới khi có tương tác người dùng đầu tiên
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
};

// Phát 1 nốt "bíp" ngắn kiểu 8-bit: sóng vuông/tam giác, tắt dần nhanh theo envelope
const playTone = (freq, duration = 0.05, type = 'square', volume = 0.045) => {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    // Giảm âm lượng theo hàm mũ để tiếng "tách" gọn, không bị rè cuối tiếng
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Im lặng bỏ qua nếu trình duyệt chặn audio (chưa có tương tác người dùng)
  }
};

// Hook dùng chung cho mọi component cần phát SFX
export const useSound = () => {
  // Tiếng "tách" ngắn khi bấm nút
  const playClick = useCallback(() => {
    playTone(720, 0.035, 'square', 0.04);
  }, []);

  // Giai điệu 2 nốt đi lên khi mở cửa sổ app
  const playOpen = useCallback(() => {
    playTone(600, 0.07, 'triangle', 0.05);
    setTimeout(() => playTone(950, 0.09, 'triangle', 0.05), 60);
  }, []);

  // Giai điệu 2 nốt đi xuống khi đóng/thu nhỏ cửa sổ
  const playClose = useCallback(() => {
    playTone(700, 0.06, 'triangle', 0.045);
    setTimeout(() => playTone(420, 0.09, 'triangle', 0.045), 55);
  }, []);

  // Tiếng "tạch" cực nhỏ, cao độ cho hiệu ứng gõ chữ (typewriter)
  const playType = useCallback(() => {
    playTone(1500, 0.012, 'square', 0.018);
  }, []);

  // Tiếng "meo~" tổng hợp bằng pitch-sweep cho pet, không cần file âm thanh
  const playMeow = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
      // Bỏ qua nếu bị chặn autoplay
    }
  }, []);

  // Tiếng "ting" 2 nốt khi ghép đúng 1 cặp thẻ trong Memory Match
  const playMatch = useCallback(() => {
    playTone(700, 0.05, 'triangle', 0.045);
    setTimeout(() => playTone(1000, 0.07, 'triangle', 0.045), 70);
  }, []);

  // Giai điệu ngắn 4 nốt đi lên khi thắng game
  const playWin = useCallback(() => {
    const notes = [600, 750, 900, 1200];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'triangle', 0.05), i * 100);
    });
  }, []);

  return { playClick, playOpen, playClose, playType, playMeow, playMatch, playWin };
};