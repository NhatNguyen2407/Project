
// DANH SÁCH NGÀY ĐẶC BIỆT - BRO TỰ THÊM/SỬA NGÀY Ở ĐÂY
// month dùng theo cách gọi bình thường (1 = Tháng 1, ..., 12 = Tháng 12),
// KHÔNG theo kiểu JS Date.getMonth() (0-11) - hook useSpecialDay.js đã tự xử lý
// phần chuyển đổi này, chỉ cần điền số tháng bình thường ở đây.
//
// So khớp theo tháng+ngày, bỏ qua năm - nên cứ tới đúng ngày này hàng năm là
// tự động kích hoạt lại, không cần sửa gì thêm.
export const SPECIAL_DATES = [
  {
    month: 10,
    day: 24,
    label: 'Kỷ niệm ngày yêu nhau',
    message: '🎉 Hôm nay là kỷ niệm ngày tụi mình chính thức yêu nhau! 💜',
  },
  {
    month: 2,
    day: 14,
    label: 'Valentine',
    message: '💘 Happy Valentine của tụi mình!',
  },
  // 👉 Thêm ngày đặc biệt khác ở đây, theo đúng mẫu 2 object phía trên
];