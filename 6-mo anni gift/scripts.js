// ==========================================
// 0. HÀM ĐIỀU HƯỚNG CHUNG (TÍCH HỢP LOADING & TẮT NHẠC)
// ==========================================
function navigateTo(sectionId, delay) {
    var waitTime = delay !== undefined ? delay : 800; 
    var loadingScreen = document.getElementById('loading-screen');
    
    // 1. Bật màn hình Loading
    loadingScreen.classList.remove('inactive-screen');
    loadingScreen.classList.add('active-screen');

    // 2. TỰ ĐỘNG TẮT NHẠC (Nếu đang phát) khi chuyển trang
    if (typeof currentAudio !== 'undefined' && currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; 
        if (typeof currentVinyl !== 'undefined' && currentVinyl) {
            currentVinyl.classList.remove('spinning');
        }
    }

    // 3. Chờ quay loading xong rồi mới chuyển trang
    setTimeout(function() {
        // Ẩn tất cả các trang
        document.querySelectorAll('.section').forEach(function(s) {
            s.classList.remove('active');
        });

        // Hiện trang được yêu cầu
        var target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            window.location.hash = sectionId.replace('-section', ''); 
        }

        // Tắt màn hình Loading
        loadingScreen.classList.remove('active-screen');
        loadingScreen.classList.add('inactive-screen');
    }, waitTime);
}

// ==========================================
// 0.5 XỬ LÝ NÚT MỞ THƯ (INTRO)
// ==========================================
var openLetterBtn = document.getElementById('open-letter-btn');
if (openLetterBtn) {
    openLetterBtn.addEventListener('click', function() {
        var introScreen = document.getElementById('pre-intro-screen');
        var authScreen = document.getElementById('auth-screen');

        introScreen.classList.add('hide-intro');

        setTimeout(function() {
            introScreen.classList.remove('active-screen');
            introScreen.classList.add('inactive-screen');
            
            authScreen.classList.remove('inactive-screen');
            authScreen.classList.add('active-screen');
        }, 800);
    });
}

// ==========================================
// 1. XỬ LÝ MẬT MÃ (Authentication)
// ==========================================
document.getElementById('auth-btn').addEventListener('click', function() {
    var password = document.getElementById('password').value;
    var correctPassword = "24102025";
    var errorMessage = document.getElementById('error-message');

    if (password === correctPassword) {
        document.getElementById('auth-screen').classList.remove('active-screen');
        document.getElementById('auth-screen').classList.add('inactive-screen');
        document.getElementById('main-content').classList.remove('inactive-screen');
        document.getElementById('main-content').classList.add('active-screen');

        // Qua pass là gọi Loading 0.5s rồi vào Welcome
        navigateTo('welcome-section', 500); 
    } else {
        errorMessage.innerText = "Really, u don't remember it? 🥺";
    }
});

// ==========================================
// 2. XỬ LÝ CÁC NÚT Ở TRANG ĐẦU (Welcome & Plead)
// ==========================================
var noBtn = document.getElementById('no-btn');
var yesBtn = document.getElementById('yes-btn');
var goBackBtn = document.getElementById('go-back-btn');

if (noBtn) {
    noBtn.addEventListener('click', function() {
        navigateTo('plead-section');
    });
}

if (goBackBtn) {
    goBackBtn.addEventListener('click', function() {
        navigateTo('welcome-section');
    });
}

if (yesBtn) {
    yesBtn.addEventListener('click', function() {
        // Nút Yup cho loading 2 giây để tạo hồi hộp
        navigateTo('menu-section', 2000); 
    });
}

// ==========================================
// 3. XỬ LÝ NHẢY TRANG (Từ Mục lục, Next/Back và nút Ending)
// ==========================================
document.addEventListener('click', function(e) {
    // Bắt mọi sự kiện click vào các class 'jump-link'
    if (e.target.classList.contains('jump-link') || e.target.closest('.jump-link')) {
        e.preventDefault();
        var targetBtn = e.target.classList.contains('jump-link') ? e.target : e.target.closest('.jump-link');
        var targetId = targetBtn.getAttribute('data-target');
        
        if (targetId) {
            navigateTo(targetId); // Kích hoạt loading mặc định và chuyển trang
        }
    }
});

// ==========================================
// 4. XỬ LÝ PHÁT NHẠC (ĐĨA THAN)
// ==========================================
var currentAudio = null; 
var currentVinyl = null; 

function toggleAudio(audioId, vinylElement) {
    var audio = document.getElementById(audioId);

    // Nếu bấm lại vào bài ĐANG PHÁT -> Tạm dừng
    if (audio === currentAudio && !audio.paused) {
        audio.pause();
        vinylElement.classList.remove('spinning');
        return;
    }

    // Nếu có bài khác đang phát -> Dừng bài cũ lại, trả về 0s
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; 
        if (currentVinyl) {
            currentVinyl.classList.remove('spinning');
        }
    }

    // Phát bài mới và xoay đĩa
    audio.play();
    vinylElement.classList.add('spinning');
    
    currentAudio = audio;
    currentVinyl = vinylElement;
    
    // Ngừng quay khi bài hát hết
    audio.onended = function() {
        vinylElement.classList.remove('spinning');
    };
}