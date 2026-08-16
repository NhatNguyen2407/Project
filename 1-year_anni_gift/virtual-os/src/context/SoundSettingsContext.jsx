import React, { createContext, useContext, useState, useMemo } from 'react';

const SoundSettingsContext = createContext(null);

// Bọc component này ở tầng cao nhất (App.jsx) để mọi nơi trong OS dùng chung
// 1 mức âm lượng - kéo thanh volume trong taskbar là chỉnh TẤT CẢ âm thanh
// (nhạc + SFX) của riêng OS này, không liên quan gì tới volume hệ điều hành thật.
export const SoundSettingsProvider = ({ children }) => {
  const [volume, setVolume] = useState(80); // 0-100
  const [isMuted, setIsMuted] = useState(false);

  // Mức âm lượng thực tế đang áp dụng (0 nếu đang mute, bất kể volume đang là bao nhiêu)
  const effectiveVolume = isMuted ? 0 : volume;

  const value = useMemo(
    () => ({ volume, setVolume, isMuted, setIsMuted, effectiveVolume }),
    [volume, isMuted, effectiveVolume]
  );

  return (
    <SoundSettingsContext.Provider value={value}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = () => {
  const ctx = useContext(SoundSettingsContext);
  if (!ctx) {
    throw new Error('useSoundSettings phải được gọi bên trong <SoundSettingsProvider>');
  }
  return ctx;
};