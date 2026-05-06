import { collection, getDocs, query, where, doc, getDoc, setDoc, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

let currentUser = null;
let favoriteIds = [];
let savedPageIndex = 0;
let pendingReadUrl = "";
const favBtn = document.getElementById('fav-btn');
const readBtn = document.getElementById('read-btn');
const continueBtn = document.getElementById('continue-btn');

onAuthStateChanged(auth, async (user) => {
    favoriteIds = [];
    savedPageIndex = 0;
    if (user) {
        currentUser = user;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                if (docSnap.data().favorites) favoriteIds = docSnap.data().favorites;
                const readingProgress = docSnap.data().readingProgress || {};
                if (readingProgress[bookId]) {
                    savedPageIndex = readingProgress[bookId];
                }
            }
        } catch (error) { console.error("Lỗi lấy dữ liệu user:", error); }
    } else {
        currentUser = null;
    }
    updateUI();
});

function updateUI() {
    if (favoriteIds.includes(bookId)) favBtn.classList.add('active');
    else favBtn.classList.remove('active');

    if (savedPageIndex > 0) {
        continueBtn.style.display = "block";
        continueBtn.textContent = `TIẾP TỤC ĐỌC`;
        readBtn.textContent = "ĐỌC LẠI TỪ ĐẦU";
        continueBtn.onclick = () => {
            pendingReadUrl = `doc-sach.html?id=${bookId}&page=${savedPageIndex}`;
            document.getElementById('reading-mode-popup').style.display = 'flex';
        };
    } else {
        continueBtn.style.display = "none";
        readBtn.textContent = "ĐỌC SÁCH";
    }
}

favBtn.onclick = async () => {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
        document.getElementById('login-modal').style.display = 'flex';
        return;
    }
    if (favoriteIds.includes(bookId)) favoriteIds = favoriteIds.filter(id => id !== bookId);
    else favoriteIds.push(bookId);

    updateUI();
    try {
        await setDoc(doc(db, "users", currentUser.uid), { favorites: favoriteIds }, { merge: true });
    } catch (error) { alert("Lỗi lưu dữ liệu!"); }
};

async function loadDetail() {
    if (!bookId) {
        document.getElementById('book-title').textContent = "Không tìm thấy dữ liệu sách.";
        document.getElementById('page-loader').classList.add('hidden-loader');
        return;
    }

    try {
        const q = query(collection(db, "books"), where("google_id", "==", bookId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            document.getElementById('book-title').textContent = data.title;
            document.getElementById('book-author').textContent = "Tác giả: " + (data.author || "Đang cập nhật");
            document.getElementById('book-genre').textContent = "Thể loại: " + (data.genre || "Văn học");
            document.getElementById('book-date').textContent = data.published_date || data.year || "Đang cập nhật";
            document.getElementById('book-desc').innerHTML = data.description || data.desc || "Cuốn sách này hiện chưa có đoạn tóm tắt.";

            const coverImg = data.cover_image || 'https://placehold.co/300x450/eeeeee/999999?text=No+Cover';
            document.getElementById('book-cover').innerHTML = `<img src="${coverImg}" onerror="this.src='https://placehold.co/300x450/eeeeee/999999?text=No+Cover';">`;

            readBtn.style.display = "block";
            readBtn.onclick = () => { 
                pendingReadUrl = `doc-sach.html?id=${bookId}&page=0`; 
                document.getElementById('reading-mode-popup').style.display = 'flex';
            };

            await loadSimilarBooks(data.author, data.genre);
        } else {
            document.getElementById('book-title').textContent = "Không tìm thấy sách trong hệ thống.";
        }
        document.getElementById('page-loader').classList.add('hidden-loader');
    } catch (error) {
        document.getElementById('book-title').textContent = "Lỗi kết nối dữ liệu.";
        document.getElementById('page-loader').classList.add('hidden-loader');
    }
}

async function loadSimilarBooks(currentAuthor, currentGenre) {
    const container = document.getElementById('similar-books-container');
    try {
        const res = await fetch('Jsol/tac-pham.json');
        const json = await res.json();
        const allBooks = [...(json.recommended || []), ...(json.featured || []), ...(json.featured_poems || [])];
        const similarBooks = allBooks.filter(b => b.google_id !== bookId && ((b.author && b.author === currentAuthor) || (b.genre && b.genre === currentGenre))).slice(0, 5);

        if (similarBooks.length === 0) {
            container.innerHTML = '<p>Chưa có sách tương tự.</p>'; return;
        }
        container.innerHTML = similarBooks.map(b => {
            const title = b.title.length > 35 ? b.title.substring(0, 35) + '...' : b.title;
            const cover = b.cover_image || 'https://placehold.co/140x200?text=No+Cover';
            return `<div class="book-hover-effect similar-book-card" onclick="window.location.href='chitiet.html?id=${b.google_id}'"><img src="${cover}" onerror="this.src='https://placehold.co/140x200?text=No+Cover';"><strong>${title}</strong></div>`;
        }).join('');
    } catch (error) { container.innerHTML = ''; }
}

document.getElementById('mode-normal').onclick = () => {
    window.location.href = pendingReadUrl; 
};

document.getElementById('mode-focus').onclick = () => {
    window.location.href = pendingReadUrl + "&mode=focus"; 
};

document.getElementById('close-mode-popup').onclick = () => {
    document.getElementById('reading-mode-popup').style.display = 'none';
};

document.getElementById('mode-info-btn').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('mode-info-tooltip').classList.toggle('show');
};
document.addEventListener('click', (e) => {
    const tooltip = document.getElementById('mode-info-tooltip');
    if (tooltip && tooltip.classList.contains('show') && e.target.id !== 'mode-info-btn') {
        tooltip.classList.remove('show');
    }
});
const btnMoreSimilar = document.querySelector('.btn-more');
if (btnMoreSimilar) {
    btnMoreSimilar.onclick = () => {
        window.location.href = 'lib.html'; 
    };
}

loadDetail();