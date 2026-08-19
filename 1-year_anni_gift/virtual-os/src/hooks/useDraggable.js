import { useState, useRef, useCallback } from 'react';

// Hook dùng chung cho mọi phần tử có thể tự do kéo thả trên desktop
// (icon, sticky note, countdown widget...). Trả về vị trí hiện tại và
// 1 handler duy nhất để gắn vào onMouseDown của phần tử muốn kéo.
//
// justDraggedRef: dùng để phân biệt "vừa kéo xong" với "click bình thường" -
// component gọi hook này nên kiểm tra justDraggedRef.current trong onClick,
// nếu true thì bỏ qua (vì đó là thao tác thả chuột sau khi kéo, không phải click chọn).
//
// storageKey (tuỳ chọn): nếu truyền vào, vị trí sẽ tự lưu vào localStorage mỗi khi thả chuột,
// và tự đọc lại đúng vị trí đó ở lần load trang sau. Không truyền thì hook hoạt động y hệt
// như trước (vị trí chỉ tồn tại trong phiên hiện tại, mất khi F5).
export const useDraggable = (initialPosition, storageKey) => {
  const [position, setPosition] = useState(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            return parsed;
          }
        }
      } catch (e) {
        // localStorage lỗi hoặc dữ liệu hỏng -> bỏ qua, dùng vị trí mặc định bên dưới
      }
    }
    // initialPosition có thể là giá trị {x,y} hoặc 1 hàm trả về {x,y} (lazy init, VD tính theo window.innerWidth)
    return typeof initialPosition === 'function' ? initialPosition() : initialPosition;
  });

  const dragState = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const justDraggedRef = useRef(false);
  const positionRef = useRef(position); // Theo dõi giá trị MỚI NHẤT để lưu localStorage lúc thả chuột, tránh bị "đóng băng" giá trị cũ do closure

  const onDragMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Chỉ xử lý chuột trái
    e.stopPropagation(); // Không cho sự kiện lan lên desktop nền (tránh đóng context menu ngoài ý muốn)

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragState.current.startX;
      const deltaY = moveEvent.clientY - dragState.current.startY;
      // Chỉ tính là "đã kéo" nếu di chuyển đủ xa, tránh việc click nhẹ tay cũng bị coi là kéo
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        justDraggedRef.current = true;
      }
      const nextPosition = {
        x: dragState.current.originX + deltaX,
        y: dragState.current.originY + deltaY,
      };
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Lưu vị trí cuối cùng vào localStorage ngay khi thả chuột, để lần load trang sau
      // mọi thứ vẫn nằm đúng chỗ bro vừa kéo tới
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(positionRef.current));
        } catch (e) {
          // Bỏ qua nếu localStorage bị đầy hoặc bị chặn (VD trình duyệt ở chế độ ẩn danh)
        }
      }

      // Đợi 1 tick rồi mới xoá cờ, để onClick (chạy ngay sau mouseup) kịp đọc được giá trị true
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, storageKey]);

  return { position, setPosition, onDragMouseDown, justDraggedRef };
};