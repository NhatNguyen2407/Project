import React from 'react';
import styles from './Timeline.module.css';

// Mỗi mốc là 1 object gồm:
//   id          : số duy nhất, không trùng với mốc khác (dùng để React nhận diện)
//   date        : chuỗi ngày tháng hiển thị, VD '24/10/2025' (chỉ để hiển thị, không cần đúng format Date)
//   title       : tiêu đề ngắn gọn của mốc đó
//   description : mô tả chi tiết - có thể để chuỗi rỗng '' nếu không muốn hiện đoạn mô tả
//   image       : ảnh minh hoạ - để null nếu mốc đó không có ảnh, hoặc gán 1 biến ảnh đã import
//
// Cách thêm ảnh cho 1 mốc:
//   1. Import ảnh ở đầu file, ví dụ:
//        import firstMeet from '../../assets/images/first_meet.jpg';
//      (đặt file ảnh vào src/assets/images/ trước, giống cách Gallery đang làm)
//   2. Gán vào field image của mốc tương ứng, ví dụ: image: firstMeet
//
// Thứ tự các object trong mảng = thứ tự hiển thị trên timeline, từ TRÊN xuống DƯỚI.
// Muốn thêm 1 mốc mới: copy nguyên 1 object bên dưới, đổi id thành số chưa dùng,
// rồi sửa lại date/title/description/image cho phù hợp.
// ============================================================================

const TIMELINE_DATA = [
  {
    id: 1,
    date: '__/__/____',
    title: 'Lần đầu gặp nhau',
    description: 'Kể lại khoảnh khắc',
    image: null,
  },
  {
    id: 2,
    date: '__/__/____',
    title: 'Lần đầu đi chơi cùng nhau',
    description: '',
    image: null,
  },
  {
    id: 3,
    date: '24/10/2025',
    title: 'Ngày chính thức yêu nhau',
    description: 'Kể lại khoảnh khắc',
    image: null,
  },
  {
    id: 4,
    date: '__/__/____',
    title: 'Một cột mốc đáng nhớ khác',
    description: '',
    image: null,
  },
  //  Thêm mốc
];

const Timeline = () => {
  return (
    <div className={styles.container}>
      {TIMELINE_DATA.map((item) => (
        <div key={item.id} className={styles.entry}>
          <div className={styles.dot} />
          <div className={styles.card}>
            <p className={styles.date}>{item.date}</p>
            <h4 className={styles.title}>{item.title}</h4>
            {item.image && (
              <img src={item.image} alt={item.title} className={styles.image} />
            )}
            {item.description && (
              <p className={styles.description}>{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;