
// thêm achievement mới: thêm 1 entry vào object ACHIEVEMENTS bên dưới
// (key = id duy nhất, không trùng với id khác), rồi gọi:
//   const { unlock } = useAchievements();
//   unlock('id_vừa_thêm');
// ở đúng chỗ trong code muốn kích hoạt nó.
//
// category:
//   'app'  - Achievement "mở app lần đầu". Desktop.jsx TỰ ĐỘNG gọi unlock(`open_${app.id}`)
//            mỗi khi mở 1 app MỚI bất kỳ trong mảng APPS - nên khi thêm app mới, chỉ cần thêm
//            1 entry category 'app' ở đây với key đúng format `open_<app.id>` là xong,
//            KHÔNG cần sửa gì thêm ở Desktop.jsx.
//   'action' - Gắn với 1 hành động cụ thể, cần tự gọi unlock() thủ công tại nơi xảy ra.
//   'meta' - Tự động tính dựa trên các achievement khác (xem AchievementsContext.jsx),
//            KHÔNG unlock thủ công.
export const ACHIEVEMENTS = {
  //Mở app lần đầu (tự động, xem Desktop.jsx handleOpenApp)
  open_gallery: { title: 'Ngắm lại kỷ niệm', description: 'Mở Gallery lần đầu tiên', icon: '🖼️', category: 'app' },
  open_music: { title: 'Bật nhạc nào', description: 'Mở Music Player lần đầu tiên', icon: '🎵', category: 'app' },
  open_letter: { title: 'Đọc thư tay', description: 'Mở Love Letter lần đầu tiên', icon: '💌', category: 'app' },
  open_memory: { title: 'Vào phòng game', description: 'Mở Memory Match lần đầu tiên', icon: '🃏', category: 'app' },
  open_terminal: { title: 'Hacker mode', description: 'Mở Terminal lần đầu tiên', icon: '⌨️', category: 'app' },
  open_timeline: { title: 'Nhìn lại chặng đường', description: 'Mở Timeline lần đầu tiên', icon: '🗓️', category: 'app' },

  //Hành động cụ thể (gọi unlock() thủ công tại đúng chỗ xảy ra)
  memory_master: { title: 'Trí nhớ đỉnh cao', description: 'Thắng 1 ván Memory Match', icon: '🏆', category: 'action' },
  terminal_whoami: { title: 'Tự nhận diện', description: 'Gõ lệnh "whoami" trong Terminal', icon: '🙋', category: 'action' },
  secret_finder: { title: 'Đào bới bí mật', description: 'Đọc "cat secret.txt" trong Terminal', icon: '🔍', category: 'action' },
  shutdown_egg: { title: 'Tắt máy an toàn', description: 'Dùng "Shut Down" trong menu chuột phải', icon: '⏻', category: 'action' },
  prankster: { title: 'Ctrl+Alt+Bug', description: 'Kích hoạt màn hình lỗi bí mật', icon: '💙', category: 'action' },
  rename_icon: { title: 'Đặt tên riêng', description: 'Đổi tên 1 icon trên desktop', icon: '✏️', category: 'action' },
  change_theme: { title: 'Đổi gu thẩm mỹ', description: 'Đổi theme màu desktop qua menu chuột phải', icon: '🎨', category: 'action' },

  //Meta - tự động tính, không unlock thủ công
  explorer: { title: 'Nhà thám hiểm', description: 'Mở hết tất cả các app trong OS', icon: '🗺️', category: 'meta' },
};