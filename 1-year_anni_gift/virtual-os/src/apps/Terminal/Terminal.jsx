import React, { useState, useRef, useEffect } from 'react';
import styles from './Terminal.module.css';
import { useSound } from '../../hooks/useSound';

const PROMPT = 'nhinhi@bibi-os:~$';

const BOOT_LINES = [
  'BiBi-OS Terminal v1.0.0',
  'Đang tải các mô-đun cảm xúc... OK',
  'Đang kết nối tới trái tim... OK',
  'Gõ "help" để xem danh sách lệnh khả dụng.',
  '',
];

// Toàn bộ logic lệnh nằm gọn ở đây - muốn thêm lệnh mới chỉ cần thêm 1 entry vào object này
const buildCommands = ({ setLines, clearLines }) => ({
  help: () => [
    'Các lệnh khả dụng:',
    '  help            - Xem danh sách lệnh',
    '  whoami          - Bạn là ai trong hệ thống này?',
    '  love --status   - Kiểm tra trạng thái tình yêu hiện tại',
    '  ls              - Liệt kê các app đang có',
    '  cat secret.txt  - Đọc file bí mật',
    '  date            - Xem ngày giờ hiện tại',
    '  history         - Xem lại các lệnh đã gõ',
    '  clear           - Xoá màn hình',
    '  sudo make me a sandwich',
  ],
  whoami: () => ['NhiNhi - người dùng có quyền truy cập cao nhất vào tim của tui. 💜'],
  ls: () => ['GALLERY.EXE   MUSIC_PLAYER.EXE   LOVE_LETTER.TXT   MEMORY_MATCH.EXE'],
  date: () => [new Date().toLocaleString('vi-VN')],
  clear: () => {
    clearLines();
    return null; // Không in thêm dòng nào sau khi clear
  },
  'cat secret.txt': () => [
    '> Đọc file secret.txt...',
    'Thật ra không có bí mật kỹ thuật nào ở đây cả,',
    'bí mật duy nhất là tui đã giấu bao nhiêu buổi tối',
    'ngồi code cái OS này chỉ để thấy em cười lúc mở nó ra. 💜',
  ],
  'love --status': () => [
    'Đang kiểm tra trạng thái hệ thống...',
    'STATUS: ĐANG CHẠY ỔN ĐỊNH',
    'UPTIME: 1 năm và vẫn đang đếm tiếp không ngừng',
    'BUGS PHÁT HIỆN: 0 (chưa từng có, kể cả lúc cãi nhau)',
  ],
  'sudo make me a sandwich': () => [
    'Quyền admin đã được cấp.',
    'Đang chế biến... 🥪',
    'Đây, 1 chiếc bánh mì ảo - thật ra là 1 cái ôm thật đó.',
  ],
});

const Terminal = () => {
  const [lines, setLines] = useState([]); // { id, text }[]
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const idRef = useRef(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { playType } = useSound();

  const pushLines = (texts) => {
    if (!texts) return;
    setLines((prev) => [
      ...prev,
      ...texts.map((t) => ({ id: idRef.current++, text: t })),
    ]);
  };

  const clearLines = () => setLines([]);

  const commandsRef = useRef(buildCommands({ setLines, clearLines }));

  // Boot log hiện từng dòng 1 khi mở app, giống terminal thật đang khởi động
  useEffect(() => {
    let cancelled = false;
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        if (!cancelled) pushLines([line]);
      }, i * 260);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const runCommand = (raw) => {
    const cmd = raw.trim();
    pushLines([`${PROMPT} ${cmd}`]);

    if (cmd === '') return;

    setCmdHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    if (cmd === 'history') {
      pushLines(cmdHistory.length ? cmdHistory : ['(chưa có lệnh nào trước đó)']);
      return;
    }

    const handler = commandsRef.current[cmd];
    if (handler) {
      const output = handler();
      pushLines(output);
    } else {
      pushLines([`command not found: ${cmd}`, 'Gõ "help" để xem danh sách lệnh.']);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      }
    } else {
      // Tiếng gõ phím nhẹ, dùng lại đúng SFX của hiệu ứng typewriter ở Love Letter
      if (e.key.length === 1) playType();
    }
  };

  return (
    <div className={styles.container} onClick={() => inputRef.current?.focus()}>
      <div className={styles.output}>
        {lines.map((line) => (
          <div key={line.id} className={styles.line}>{line.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>{PROMPT}</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Terminal;