import React, { useState, useRef } from 'react';
import styles from './MusicPlayer.module.css';
import PixelProgressBar from '../../components/PixelProgressBar/PixelProgressBar';

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
  const audioRefs = useRef({}); // Lưu trữ các thẻ <audio>

  // Hàm xử lý Play/Pause nhạc
  const togglePlay = (id) => {
    const currentAudio = audioRefs.current[id];

    if (playingId === id) {
      // Nếu bấm vào bài đang phát -> Tạm dừng
      currentAudio.pause();
      setPlayingId(null);
    } else {
      // Nếu có bài khác đang phát -> Dừng bài cũ
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
        audioRefs.current[playingId].currentTime = 0; // Trả về đầu bài
      }
      // Phát bài mới
      setPlayProgress(0);
      currentAudio.play();
      setPlayingId(id);
    }
  };

  // Cập nhật % tiến trình mỗi khi audio phát ra sự kiện timeupdate
  const handleTimeUpdate = (e) => {
    const { currentTime, duration } = e.target;
    if (duration > 0) {
      setPlayProgress((currentTime / duration) * 100);
    }
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
                  onTimeUpdate={playingId === song.id ? handleTimeUpdate : undefined}
                  onEnded={() => { setPlayingId(null); setPlayProgress(0); }} // Hết bài tự tắt đĩa than
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