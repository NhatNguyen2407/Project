import React, { useState, useRef, useEffect } from 'react';
import styles from './MusicPlayer.module.css';
import PixelProgressBar from '../../components/PixelProgressBar/PixelProgressBar';
import { useSoundSettings } from '../../context/SoundSettingsContext';

// 1. Import Ảnh
import pastBibiImg from '../../assets/images/albumbibi.jpg';
import pastNhiNhiImg from '../../assets/images/albumnhinhi.jpg';
import afterLikeImg from '../../assets/images/afterlikecover.jpg';
import newBeginningsImg from '../../assets/images/newbeginningscover.jpg';
import sukidakaraImg from '../../assets/images/sukidakaracover.png';
import escapismImg from '../../assets/images/Escapism_Singles_Cover.jpg';
import hereComesImg from '../../assets/images/herecomesathought.jpg';
import loveLikeYouImg from '../../assets/images/Love_Like_You.jpg';

// 2. Import Nhạc
import afterLikeAudio from '../../assets/audio/afterlike.mp3';
import newBeginningsAudio from '../../assets/audio/newbeginnings.mp3';
import sukidakaraAudio from '../../assets/audio/sukidakara.mp3';
import escapismAudio from '../../assets/audio/escapism.mp3';
import hereComesAudio from '../../assets/audio/herecomesathought.mp3';
import loveLikeYouAudio from '../../assets/audio/lovelikeyou.mp3';

// 3. Data Playlist
const PLAYLIST = [
  { id: 's1', title: 'After Like', artist: 'IVE', cover: afterLikeImg, src: afterLikeAudio },
  { id: 's2', title: 'New Beginnings', artist: 'NEFFEX', cover: newBeginningsImg, src: newBeginningsAudio },
  { id: 's3', title: '好きだから', artist: 'ユイカ ft. れん', cover: sukidakaraImg, src: sukidakaraAudio },
  { id: 's4', title: 'Escapism', artist: 'Steven Universe', cover: escapismImg, src: escapismAudio },
  { id: 's5', title: 'Here Comes A Thought', artist: 'Steven Universe', cover: hereComesImg, src: hereComesAudio },
  { id: 's6', title: 'Love Like You', artist: 'Steven Universe', cover: loveLikeYouImg, src: loveLikeYouAudio },
];

const MusicPlayer = () => {
  const [activeTab, setActiveTab] = useState('shared');
  const [playingId, setPlayingId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0); // % tiến trình bài đang phát
  const [playElapsed, setPlayElapsed] = useState(0); // Giây hiện tại của bài đang phát
  const [durations, setDurations] = useState({}); // { [songId]: giây } - tự điền khi mỗi <audio> tải xong metadata, độc lập theo từng bài
  const audioRefs = useRef({}); // Lưu trữ các thẻ <audio>
  const { effectiveVolume } = useSoundSettings(); // Volume dùng chung toàn OS (0-100)

  // mm:ss - dùng chung cho cả thời lượng tổng và thời điểm đang phát
  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Áp dụng volume ngay khi bắt đầu phát, và cập nhật liên tục nếu người dùng
  // kéo thanh volume/bấm mute trong lúc bài đang chạy
  useEffect(() => {
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].volume = effectiveVolume / 100;
    }
  }, [effectiveVolume, playingId]);

  // Hàm xử lý Play/Pause nhạc
  const togglePlay = (id) => {
    const currentAudio = audioRefs.current[id];

    if (playingId === id) {
      // Nếu bấm vào bài đang phát -> Tạm dừng (giữ nguyên vị trí đang nghe dở)
      currentAudio.pause();
      setPlayingId(null);
    } else {
      // Nếu có bài khác đang phát -> Dừng bài cũ
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
        audioRefs.current[playingId].currentTime = 0; // Trả về đầu bài
      }
      // Phát bài mới - reset cả % tiến trình lẫn thời gian hiển thị về 0 cho bài mới này
      setPlayProgress(0);
      setPlayElapsed(0);
      currentAudio.volume = effectiveVolume / 100;
      currentAudio.play();
      setPlayingId(id);
    }
  };

  // Cập nhật % tiến trình + số giây hiện tại mỗi khi audio phát ra sự kiện timeupdate
  const handleTimeUpdate = (e) => {
    const { currentTime, duration } = e.target;
    setPlayElapsed(currentTime);
    if (duration > 0) {
      setPlayProgress((currentTime / duration) * 100);
    }
  };

  // Ghi nhận thời lượng tổng của TỪNG bài ngay khi trình duyệt đọc xong metadata file -
  // chạy độc lập cho mọi bài (kể cả chưa từng bấm play), lưu theo key = song.id nên
  // không bao giờ bị lẫn/lỗi giữa các bài khi chuyển qua lại
  const handleLoadedMetadata = (songId) => (e) => {
    setDurations((prev) => ({ ...prev, [songId]: e.target.duration }));
  };

  return (
    <div className={styles.container}>
      {/* Thanh Tabs */}
      <div className={styles.tabBar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'shared' ? styles.active : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          ✨ Our Melody
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'past' ? styles.active : ''}`}
          onClick={() => setActiveTab('past')}
        >
          🎧 Gu Nhạc Ngày Xưa
        </button>
      </div>

      {/* TAB 1: OUR MELODY (Playlist chung) */}
      {activeTab === 'shared' && (
        <div className={styles.tabContent}>
          <p className={styles.description}>
            Cũng có, trong số đó, những giai điệu đặc biệt nữa đó... Những bài hát gợi nhớ đến em và những bài em thích nhất!
          </p>
          
          <div className={styles.playlistGrid}>
            {PLAYLIST.map((song) => (
              <div 
                key={song.id} 
                className={`${styles.songCard} ${playingId === song.id ? styles.playingCard : ''}`}
                onClick={() => togglePlay(song.id)}
              >
                {/* Vinyl Đĩa Than */}
                <div className={styles.vinylWrapper}>
                  <img 
                    src={song.cover} 
                    alt={song.title} 
                    className={`${styles.vinylRecord} ${playingId === song.id ? styles.spinning : ''}`} 
                  />
                  <div className={styles.vinylHole}></div>
                </div>
                
                {/* Thông tin bài hát */}
                <div className={styles.songInfo}>
                  <h4 className={styles.songTitle}>{song.title}</h4>
                  <p className={styles.songArtist}>{song.artist}</p>
                  {/* Thời gian: đang phát thì hiện "hiện tại / tổng", còn lại chỉ hiện tổng thời lượng của riêng file đó */}
                  <p className={styles.songDuration}>
                    {playingId === song.id
                      ? `${formatTime(playElapsed)} / ${formatTime(durations[song.id])}`
                      : formatTime(durations[song.id])}
                  </p>
                  {/* Thanh tiến trình pixel, chỉ hiện ở bài đang phát */}
                  {playingId === song.id && (
                    <div className={styles.progressWrap}>
                      <PixelProgressBar progress={playProgress} segments={16} />
                    </div>
                  )}
                </div>
                
                {/* Nút Play ảo */}
                <div className={styles.playIndicator}>
                  {playingId === song.id ? '⏸' : '▶'}
                </div>

                {/* Thẻ audio ẩn để xử lý logic */}
                <audio 
                  ref={(el) => (audioRefs.current[song.id] = el)} 
                  src={song.src}
                  onLoadedMetadata={handleLoadedMetadata(song.id)}
                  onTimeUpdate={playingId === song.id ? handleTimeUpdate : undefined}
                  onEnded={() => { setPlayingId(null); setPlayProgress(0); setPlayElapsed(0); }} // Hết bài tự tắt đĩa than
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUÁ KHỨ */}
      {activeTab === 'past' && (
        <div className={styles.tabContent}>
          <p className={styles.description}>
            Biếc sao khôm? Ngày trước thì gu nhạc 2 đứa trông...
          </p>
          <div className={styles.pastGrid}>
            <div className={styles.pastCard}>
              <img src={pastBibiImg} alt="Gu của anh" className={styles.pastImg} />
              <h4 className={styles.pastTitle}>Gu của Anh</h4>
              <p className={styles.pastDesc}>Anh thì tạp nham, chả đâu vào đâu.</p>
            </div>
            <div className={styles.pastCard}>
              <img src={pastNhiNhiImg} alt="Gu của em" className={styles.pastImg} />
              <h4 className={styles.pastTitle}>Gu của Em</h4>
              <p className={styles.pastDesc}>Em thì dân K-Pop đún nghĩa.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;