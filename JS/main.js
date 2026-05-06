import { collection, getDocs, doc, getDoc, setDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

// 0. HỆ THỐNG POPUP GLOBAL
window.showPopup = window.showPopup || function(msg) {
    let popup = document.getElementById('custom-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'custom-popup';
        popup.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100000; display: none; justify-content: center; align-items: center; backdrop-filter: blur(4px);";
        popup.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s ease;">
                <div id="popup-msg-text" style="font-size: 16px; margin-bottom: 25px; color: #333; line-height: 1.5; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-weight: 600;"></div>
                <button onclick="document.getElementById('custom-popup').style.display='none'" style="background: #16A34A; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Đóng</button>
            </div>
        `;
        if (!document.getElementById('popup-styles')) {
            const style = document.createElement('style');
            style.id = 'popup-styles';
            style.innerHTML = `@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
            document.head.appendChild(style);
        }
        document.body.appendChild(popup);
    }
    document.getElementById('popup-msg-text').textContent = msg;
    popup.style.display = 'flex';
};

// 1. RENDER SÁCH & SLIDER
export function renderBooksToHTML(booksArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    booksArray.forEach(book => {
        const title = book.title.length > 45 ? book.title.substring(0, 45) + "..." : book.title;
        const html = `
            <div class="book-item" style="cursor: pointer;" onclick="window.location.href='chitiet.html?id=${book.google_id}'">
                <img src="${book.cover_image || 'https://placehold.co/177x266?text=No+Cover'}" class="book-img" onerror="this.src='https://placehold.co/177x266?text=No+Cover'">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${book.author}</p>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

async function autoSync() {
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
    try {
        const response = await fetch('./Jsol/tac-pham.json');
        const jsonData = await response.json();

        const allItems = [...(jsonData.recommended || []), ...(jsonData.featured || []), ...(jsonData.featured_poems || [])];
        
        for (const item of allItems) {
            if (!item.google_id) continue;
            const bookRef = doc(db, "books", item.google_id);
            const docSnap = await getDoc(bookRef);
            
            if (!docSnap.exists()) {
                await setDoc(bookRef, {
                    ...item,
                    content: item.content || "Nội dung đang cập nhật..."
                });
            }
        }
    } catch (e) { console.error("Sync error:", e); }
}
autoSync();

async function loadBooks(user = null) {
    if (!document.getElementById('recommended-container') && !document.getElementById('featured-container')) return; 
    
    try {
        const snapshot = await getDocs(collection(db, "books"));
        let allBooks = [];
        snapshot.forEach(doc => allBooks.push(doc.data()));

        if (allBooks.length === 0) {
            const response = await fetch('./Jsol/tac-pham.json');
            const jsonData = await response.json();
            allBooks = [...(jsonData.recommended || []), ...(jsonData.featured || []), ...(jsonData.featured_poems || [])];
        }
        let totalReads = allBooks.reduce((sum, book) => sum + (book.completed_reads || 0), 0);
        let onlineCount = totalReads > 0 ? totalReads * 34 : Math.floor(Math.random() * 50) + 120;
    
        const onlineEls = document.querySelectorAll('.online-count');
        onlineEls.forEach(el => el.textContent = `Online: ${onlineCount.toLocaleString('vi-VN')}`);
        
        if (document.getElementById('featured-container')) {
            const featuredContainer = document.getElementById('featured-container');
            let featured = [...allBooks]
                .filter(book => (book.completed_reads || 0) > 0)
                .sort((a, b) => (b.completed_reads || 0) - (a.completed_reads || 0))
                .slice(0, 5);

            if (featured.length === 0) {
                featuredContainer.innerHTML = '<p style="text-align: center; width: 100%; color: #666; font-size: 18px; margin-top: 20px; font-weight: bold; letter-spacing: 1px;">TẠM THỜI ĐANG CẬP NHẬT</p>';
                featuredContainer.style.transform = 'none';
            } else {
                renderBooksToHTML(featured, 'featured-container');
            }
        }

        if (document.getElementById('recommended-container')) {
            const defaultTitles = ["chí phèo", "tập thơ hồ chí minh", "tắt đèn", "lão hạc", "chiếc lược ngà"];
            let recommended = [];

            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists() && userSnap.data().favorites) {
                    const favIds = userSnap.data().favorites;
                    let favGenres = new Set();
                    let favAuthors = new Set();

                    allBooks.forEach(b => {
                        if (favIds.includes(b.google_id)) {
                            if (b.genre) favGenres.add(b.genre);
                            if (b.author) favAuthors.add(b.author);
                        }
                    });
                    allBooks.forEach(b => {
                        if (favGenres.has(b.genre) || favAuthors.has(b.author)) {
                            recommended.push(b);
                        }
                    });
                }
            }

            allBooks.forEach(book => {
                if (book.title && defaultTitles.some(title => book.title.toLowerCase().includes(title))) {
                    recommended.push(book);
                }
            });
            recommended = recommended.filter((v, i, a) => a.findIndex(t => (t.google_id === v.google_id)) === i);

            if (recommended.length === 0) recommended = allBooks.slice(0, 10);

            renderBooksToHTML(recommended, 'recommended-container');
        }

        initSliders(); 

    } catch (error) {
        console.error("Lỗi tải sách:", error);
    } finally {
        const loader = document.getElementById('page-loader');
        if (loader) loader.classList.add('hidden-loader');
    }
}

function initSliders() {
    const tracks = document.querySelectorAll('.books-container');
    
    function updateCenterFeature(track) {
        if (!track.firstElementChild || !track.firstElementChild.classList.contains('book-item')) return;
        Array.from(track.children).forEach(el => el.classList.remove('book-featured'));
        if (track.children.length > 2) {
            track.children[2].classList.add('book-featured');
        }
    }

   function slideBooks(track) {
        const firstBook = track.firstElementChild;
        if (!firstBook || track.children.length <= 3 || !firstBook.classList.contains('book-item')) return;
        
        const slideDistance = firstBook.offsetWidth + 40; 
 
        Array.from(track.children).forEach(el => el.classList.remove('book-featured'));
        if (track.children.length > 3) track.children[3].classList.add('book-featured');

        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(-${slideDistance}px)`;
        
        setTimeout(() => {
            track.style.transition = "none";
            track.appendChild(firstBook); 
            track.style.transform = "translateX(0)";
            updateCenterFeature(track);
        }, 500);
    }

    tracks.forEach(track => {
        if (track.sliderInterval) clearInterval(track.sliderInterval);
        
        setTimeout(() => updateCenterFeature(track), 100);
        
        const startSlider = () => { track.sliderInterval = setInterval(() => slideBooks(track), 3000); };
        const stopSlider = () => { clearInterval(track.sliderInterval); };
        if (track.children.length > 3 && track.firstElementChild.classList.contains('book-item')) {
            startSlider();
            if (!track.hasSliderEvents) {
                track.addEventListener('mouseenter', stopSlider);
                track.addEventListener('mouseleave', startSlider);
                track.hasSliderEvents = true;
            }
        }
    });
}

// 2. TỔNG HOA TOÀN SERVER & SỰ KIỆN CHIẾN DỊCH
function createCelebrationPopup() {
    if (document.getElementById('celebration-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';

    overlay.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(22, 163, 74, 0.96); z-index: 100000; justify-content: center; align-items: center; flex-direction: column; color: white; text-align: center; backdrop-filter: blur(8px); animation: fadeIn 0.5s ease;";
    overlay.innerHTML = `
        <button id="close-celeb-btn" style="position: absolute; top: 30px; right: 40px; background: transparent; border: 2px solid white; color: white; font-size: 24px; cursor: pointer; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transition: 0.3s;">&times;</button>
        <h1 style="font-size: 55px; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); padding: 0 20px;">CHIẾN DỊCH THÀNH CÔNG!</h1>
        <p style="font-size: 26px; max-width: 900px; line-height: 1.5; padding: 0 20px;">Cộng đồng BloomRead vừa gom đủ 300 đóa hoa. Một phần quà thiện nguyện thực tế mang tên dự án chuẩn bị được gửi đi!</p>
        <p style="font-size: 28px; margin-top: 50px; font-weight: bold; color: #FDE047;">Tổng số hoa thực tế đã quyên góp: <span id="real-flowers-count" style="font-size: 40px; text-decoration: underline;">0</span> bông</p>
        <p style="font-size: 18px; margin-top: 50px; opacity: 0.9; background: rgba(0,0,0,0.2); padding: 12px 25px; border-radius: 50px;" id="celeb-timer">Hệ thống sẽ đếm lại từ đầu sau: 05:00</p>
    `;
    document.body.appendChild(overlay);

    document.getElementById('close-celeb-btn').onclick = () => {
        document.getElementById('celebration-overlay').style.display = 'none';
        sessionStorage.setItem('hasClosedCeleb', 'true'); 
    };
}

let celebInterval;

onSnapshot(doc(db, "server", "stats"), (docSnap) => {
    if (!document.getElementById('celebration-overlay')) createCelebrationPopup();

    let globalFlowers = 0, realFlowers = 0, celebrateUntil = 0;
    if (docSnap.exists()) {
        globalFlowers = docSnap.data().totalFlowers || 0;
        realFlowers = docSnap.data().realFlowers || 0;
        celebrateUntil = docSnap.data().celebrateUntil || 0;
    } else {
        globalFlowers = 0;
        realFlowers = 0;
        celebrateUntil = 0;
    }

    const maxFlowers = 300;
    const now = Date.now();

    const currentFlowersEl = document.getElementById('current-flowers');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const globalFlowerCount = document.getElementById('global-flower-count');

    if (celebrateUntil > now) {
        const userClosedPopup = sessionStorage.getItem('hasClosedCeleb');
        if (userClosedPopup !== 'true') {
            document.getElementById('celebration-overlay').style.display = 'flex';
        }
        
        document.getElementById('real-flowers-count').textContent = realFlowers;

        if (currentFlowersEl) {
            currentFlowersEl.textContent = maxFlowers;
            progressFill.style.width = `100%`;
            progressText.textContent = `100%`;
            progressFill.style.background = 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)';
        }
        if (globalFlowerCount) globalFlowerCount.textContent = maxFlowers;

        clearInterval(celebInterval);
        celebInterval = setInterval(() => {
            const timeLeft = celebrateUntil - Date.now();
            if (timeLeft <= 0) {
                clearInterval(celebInterval);
                document.getElementById('celebration-overlay').style.display = 'none';
                sessionStorage.removeItem('hasClosedCeleb'); 
                
                if (currentFlowersEl) {
                    currentFlowersEl.textContent = "0";
                    progressFill.style.width = `0%`;
                    progressText.textContent = `0%`;
                    progressFill.style.background = 'linear-gradient(90deg, #a3f972 0%, #ffffff 100%)';
                }
                if (globalFlowerCount) globalFlowerCount.textContent = "0";
            } else {
                const m = Math.floor(timeLeft / 60000);
                const s = Math.floor((timeLeft % 60000) / 1000);
                document.getElementById('celeb-timer').textContent = `Hệ thống sẽ đếm lại từ đầu sau: 0${m}:${s < 10 ? '0'+s : s}`;
            }
        }, 1000);

    } else {
        clearInterval(celebInterval);
        document.getElementById('celebration-overlay').style.display = 'none';
        sessionStorage.removeItem('hasClosedCeleb');
        
        const percent = Math.min(Math.floor((globalFlowers / maxFlowers) * 100), 100);

        if (currentFlowersEl) {
            currentFlowersEl.textContent = globalFlowers;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
            progressFill.style.background = 'linear-gradient(90deg, #a3f972 0%, #ffffff 100%)';
        }
        if (globalFlowerCount) globalFlowerCount.textContent = globalFlowers;
    }
});

// 3. UI XÁC THỰC & CHỨC NĂNG TRANG CHỦ
onAuthStateChanged(auth, async (user) => {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userNameDisplay = document.getElementById('user-name-display');

    if (user) {
        if(authButtons) authButtons.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';
        if(userNameDisplay) userNameDisplay.textContent = user.displayName || user.email.split('@')[0];
    } else {
        if(authButtons) authButtons.style.display = 'flex';
        if(userProfile) userProfile.style.display = 'none';
    }
    loadBooks(user);
});

document.addEventListener("DOMContentLoaded", () => {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const changePassModal = document.getElementById('change-password-modal'); 

    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowRegister = document.getElementById('btn-show-register');
    
    const btnCloseLogin = document.querySelector('.close-login-btn');
    const btnCloseRegister = document.querySelector('.close-register-btn');
    const btnCloseCp = document.getElementById('close-cp-btn');
    const btnBackCp = document.getElementById('cp-back-btn');

    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const cpForm = document.getElementById('cp-form');
    const btnGoogleLogin = document.querySelector('.btn-google-login');

    const userNameDisplay = document.getElementById('user-name-display');
    const userMenu = document.getElementById('user-menu');
    const btnLogoutMenu = document.getElementById('btn-logout-menu');

    if (btnShowLogin) btnShowLogin.addEventListener('click', (e) => { e.preventDefault(); loginModal.style.display = 'flex'; });
    if (btnShowRegister) btnShowRegister.addEventListener('click', (e) => { e.preventDefault(); registerModal.style.display = 'flex'; });
    if (switchToRegister) switchToRegister.addEventListener('click', (e) => { e.preventDefault(); loginModal.style.display = 'none'; registerModal.style.display = 'flex'; });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); registerModal.style.display = 'none'; loginModal.style.display = 'flex'; });
    
    if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => loginModal.style.display = 'none');
    if (btnCloseRegister) btnCloseRegister.addEventListener('click', () => registerModal.style.display = 'none');
    if (btnCloseCp) btnCloseCp.addEventListener('click', () => changePassModal.style.display = 'none');
    if (btnBackCp) btnBackCp.addEventListener('click', (e) => { e.preventDefault(); changePassModal.style.display = 'none'; });

    window.addEventListener('click', (e) => {
        if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
        if (registerModal && e.target === registerModal) registerModal.style.display = 'none';
    });
    if(userNameDisplay) {
        userNameDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'flex' ? 'none' : 'flex';
        });
        window.addEventListener('click', (e) => {
            if (e.target !== userNameDisplay && userMenu && !userMenu.contains(e.target)) {
                userMenu.style.display = 'none';
            }
        });
    }
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-open-change-pass') {
            e.preventDefault();
            if (changePassModal) changePassModal.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none'; 
        }
    });
    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const terms = document.getElementById('reg-terms').checked;

            if (password !== confirmPassword) {
                window.showPopup("Mật khẩu lặp lại không khớp!"); return;
            }
            if (!terms) {
                window.showPopup("Vui lòng đồng ý với Điều khoản và bảo mật!"); return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    await updateProfile(user, { displayName: username });
                    await setDoc(doc(db, "users", user.uid), { username: username, email: email }, { merge: true });

                    window.showPopup("Đăng ký thành công! Chào mừng " + username);
                    userNameDisplay.textContent = username;
                    registerModal.style.display = 'none';
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') window.showPopup("Email này đã được sử dụng! Vui lòng dùng email khác hoặc Đăng nhập.");
                    else if (error.code === 'auth/weak-password') window.showPopup("Mật khẩu quá yếu (cần ít nhất 6 ký tự)!");
                    else window.showPopup("Lỗi đăng ký: " + error.message);
                });
        });
    }

    //XỬ LÝ FORM ĐĂNG NHẬP
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginInput = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            let actualEmail = loginInput;

            if (!loginInput.includes('@')) {
                try {
                    const q = query(collection(db, "users"), where("username", "==", loginInput));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        window.showPopup("Lỗi: Không tìm thấy Tên đăng nhập này trong hệ thống!");
                        return;
                    }
                    actualEmail = querySnapshot.docs[0].data().email;
                } catch (error) {
                    console.error("Lỗi tìm user:", error);
                    window.showPopup("Lỗi truy xuất dữ liệu, vui lòng thử đăng nhập bằng Email!");
                    return;
                }
            }

            signInWithEmailAndPassword(auth, actualEmail, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (user.email === "ricute069@gmail.com") {
                        window.showPopup("Kính chào Admin hệ thống!");
                    } else {
                        window.showPopup("Đăng nhập thành công!");
                    }
                    loginModal.style.display = 'none';
                })
                .catch((error) => {
                    window.showPopup("Lỗi: Mật khẩu không chính xác!");
                });
        });
    }

    //XỬ LÝ ĐỔI MẬT KHẨU
    if(cpForm) {
        cpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            const oldPass = document.getElementById('cp-old-pass').value;
            const newPass = document.getElementById('cp-new-pass').value;
            const confirmPass = document.getElementById('cp-confirm-pass').value;
            if (newPass !== confirmPass) {
                window.showPopup("Mật khẩu mới không khớp!");
                return;
            }
            try {
                const credential = EmailAuthProvider.credential(user.email, oldPass);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPass);
                window.showPopup("Đổi mật khẩu thành công!");
                changePassModal.style.display = 'none';
                cpForm.reset();
            } catch (error) {
                console.error(error);
                window.showPopup("Lỗi: Mật khẩu hiện tại không chính xác!");
            }
        });
    }

    //XỬ LÝ ĐĂNG NHẬP GOOGLE
    if(btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    if (user.email === "ricute069@gmail.com") {
                        window.showPopup("Kính chào Admin hệ thống!");
                    } else {
                        window.showPopup("Đăng nhập Google thành công!");
                    }
                    loginModal.style.display = 'none';
                }).catch((error) => {
                    console.error("Lỗi Google Auth:", error);
                });
        });
    }

    // XỬ LÝ ĐĂNG XUẤT
    if(btnLogoutMenu) {
        btnLogoutMenu.addEventListener('click', (e) => {
            e.preventDefault();
            userMenu.style.display = 'none';
            signOut(auth).then(() => {
                window.showPopup("Bạn đã đăng xuất!");
            });
        });
    }

    const track = document.getElementById('banner-track');
    if (track) {
        const images = track.querySelectorAll('.banner-img');
        let currentIndex = 0;

        setInterval(() => {
            currentIndex++;
            if (currentIndex >= images.length) {
                currentIndex = 0;
            }
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 4000);
    }
});

window.addEventListener('load', function() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden-loader');
});
setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('hidden-loader')) {
        loader.classList.add('hidden-loader');
    }
<<<<<<< HEAD
}, 1500);
