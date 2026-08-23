import { useCallback, useEffect } from 'react';
import { useSoundSettings } from '../context/SoundSettingsContext';

let sharedCtx = null;
export const getAudioContext = () => {
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null; // Trình duyệt không hỗ trợ Web Audio
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
};
const getCtx = getAudioContext;

let masterScale = 0.8;

// Phát 1 nốt "bíp" ngắn kiểu 8-bit: sóng vuông/tam giác, tắt dần nhanh theo envelope
const playTone = (freq, duration = 0.05, type = 'square', volume = 0.045) => {
  if (masterScale <= 0) return; // Đang mute hoặc volume = 0 trong OS -> im lặng hoàn toàn
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume * masterScale, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
  }
};

// Hook dùng chung cho mọi component cần phát SFX
export const useSound = () => {
  const { effectiveVolume } = useSoundSettings();

  // Đồng bộ hệ số âm lượng chung mỗi khi người dùng chỉnh slider/mute trong Taskbar
  useEffect(() => {
    masterScale = effectiveVolume / 100;
  }, [effectiveVolume]);

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
    if (masterScale <= 0) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.05 * masterScale, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
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

  // Tiếng "ting~" sáng khi mở khoá 1 achievement mới
  const playAchievement = useCallback(() => {
    playTone(880, 0.08, 'triangle', 0.05);
    setTimeout(() => playTone(1320, 0.14, 'triangle', 0.055), 90);
  }, []);

  return { playClick, playOpen, playClose, playType, playMeow, playMatch, playWin, playAchievement };
};