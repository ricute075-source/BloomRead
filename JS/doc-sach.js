import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

if (document.documentElement.classList.contains('dark-mode')) {
    document.body.classList.add('dark-mode');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = 'Giao diện Sáng';
        themeBtn.style.background = '#fff';
        themeBtn.style.color = '#222';
    }
    const focusThemeBtn = document.getElementById('focus-theme-toggle');
    if (focusThemeBtn) focusThemeBtn.textContent = 'Giao diện Sáng';
}

function toggleGlobalTheme() {
    document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('bloomTheme', isDark ? 'dark' : 'light');

    const readerToggle = document.getElementById('theme-toggle');
    if (readerToggle) {
        readerToggle.textContent = isDark ? 'Giao diện Sáng' : 'Giao diện Tối';
        readerToggle.style.background = isDark ? '#fff' : '#222';
        readerToggle.style.color = isDark ? '#222' : '#fff';
    }

    const focusToggle = document.getElementById('focus-theme-toggle');
    if (focusToggle) focusToggle.textContent = isDark ? 'Giao diện Sáng' : 'Chế độ Tối';
}

const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) themeToggleBtn.onclick = toggleGlobalTheme;
const focusThemeBtn = document.getElementById('focus-theme-toggle');
if (focusThemeBtn) focusThemeBtn.onclick = toggleGlobalTheme;

const FOCUS_KEY = 'bloomFocusState';
let focusState = JSON.parse(localStorage.getItem(FOCUS_KEY)) || {
    timeLeft: 25 * 60,
    isRunning: false,
    activeTab: 'focus',
    pendingPoints: 0,
    needsBreak: false,
    readingDuration: 0,
    accumulatedValidSeconds: 0,
    pendingFertilizer: 0,
    dailyFertilizerCount: 0,
    lastFertilizerDate: ''
};

function saveFocusState() { localStorage.setItem(FOCUS_KEY, JSON.stringify(focusState)); }
let isProgrammaticExit = false;

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
const startPage = parseInt(urlParams.get('page')) || 0;
const readingMode = urlParams.get('mode');

// YÊU CẦU 1: BẮT BUỘC ĐĂNG NHẬP NẾU DÙNG FOCUS MODE
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email === "ricute069@gmail.com") document.body.classList.add('is-admin');
        else document.body.classList.remove('is-admin');
    } else {
        document.body.classList.remove('is-admin');
        if (readingMode === 'focus') {
            window.showPopup("Bạn cần đăng nhập tài khoản để sử dụng Focus Mode!").then(() => {
                localStorage.removeItem(FOCUS_KEY);
                window.location.href = 'lib.html';
            });
        }
    }
});

window.showPopup = function (msg) {
    return new Promise((resolve) => {
        let popup = document.getElementById('custom-popup-reader');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'custom-popup-reader';
            popup.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2147483647; display: none; justify-content: center; align-items: center; backdrop-filter: blur(4px);";
            popup.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s ease;">
            <div id="popup-msg-text" style="font-size: 16px; margin-bottom: 25px; color: #333; line-height: 1.5; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-weight: 600;"></div>
            <button id="close-popup-btn" style="background: #16A34A; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Đóng</button>
        </div>
    `;
            document.body.appendChild(popup);
        }
        document.getElementById('popup-msg-text').textContent = msg;
        popup.style.display = 'flex';
        document.getElementById('close-popup-btn').onclick = () => { popup.style.display = 'none'; resolve(); };
    });
};

window.showConfirm = function (msg) {
    return new Promise((resolve) => {
        let confirmBox = document.getElementById('custom-confirm-reader');
        if (!confirmBox) {
            confirmBox = document.createElement('div');
            confirmBox.id = 'custom-confirm-reader';
            confirmBox.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2147483647; display: none; justify-content: center; align-items: center; backdrop-filter: blur(4px);";
            confirmBox.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s ease;">
            <div id="confirm-msg-text" style="font-size: 16px; margin-bottom: 25px; color: #333; line-height: 1.5; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-weight: 600;"></div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btn-confirm-no" style="background: #9CA3AF; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Hủy</button>
                <button id="btn-confirm-yes" style="background: #16A34A; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Đồng ý</button>
            </div>
        </div>
    `;
            document.body.appendChild(confirmBox);
        }
        document.getElementById('confirm-msg-text').textContent = msg;
        confirmBox.style.display = 'flex';
        document.getElementById('btn-confirm-yes').onclick = () => { confirmBox.style.display = 'none'; resolve(true); };
        document.getElementById('btn-confirm-no').onclick = () => { confirmBox.style.display = 'none'; resolve(false); };
    });
};

window.showReflectionPopup = function () {
    return new Promise((resolve) => {
        const popup = document.getElementById('reflection-popup');
        const textarea = document.getElementById('reflection-textarea');
        const wordCount = document.getElementById('reflection-word-count');
        const submitBtn = document.getElementById('reflection-submit-btn');
        const skipBtn = document.getElementById('reflection-skip-btn');

        textarea.value = '';
        wordCount.textContent = '0/50 từ';
        popup.style.display = 'flex';

        textarea.oninput = () => {
            let words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 50) {
                words = words.slice(0, 50);
                textarea.value = words.join(' ') + ' ';
            }
            wordCount.textContent = `${words.length}/50 từ`;
        };

        submitBtn.onclick = () => { popup.style.display = 'none'; resolve(textarea.value); };
        skipBtn.onclick = () => { popup.style.display = 'none'; resolve(null); };
    });
};

let startTime = Date.now();
let accumulatedWords = 0;
let readPoemIndices = new Set();

let currentGenre = "Văn học";
let currentCollection = [];
let currentIndex = 0;
let globalTitle = "";
let globalAuthor = "";
let globalDate = "";
let isPoetryCollection = false;

function formatReadableText(rawHtml) {
    if (!rawHtml) return "";
    let formatted = rawHtml.replace(/([^\.])\.(?!\.)/g, '$1.<br><br>').replace(/(\s-)/g, '<br><br>$1');
    return formatted.replace(/(<br>\s*){3,}/g, '<br><br>');
}

function countWords(html) {
    const text = html.replace(/<[^>]*>/g, " ");
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function splitHTMLIntoPages(htmlContent, maxWords = 500) {
    if (!htmlContent) return [];

    let text = htmlContent;
    text = text.replace(/<\/p>/gi, '<br><br>');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\n{2,}/g, '<br><br>');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/(<br\s*\/?>\s*){2,}/gi, '<br><br>');

    let chunks = text.split('<br><br>').map(c => c.trim()).filter(c => c.length > 0);

    let finalChunks = [];
    for (let chunk of chunks) {
        if (countWords(chunk) > maxWords) {
            let sentences = chunk.split(/(?<=[.?!])\s+/);
            let tempChunk = "";
            for (let sentence of sentences) {
                if (countWords(tempChunk) + countWords(sentence) > maxWords && tempChunk !== "") {
                    finalChunks.push(tempChunk + '<br><br>');
                    tempChunk = sentence;
                } else {
                    tempChunk += (tempChunk ? " " : "") + sentence;
                }
            }
            if (tempChunk) finalChunks.push(tempChunk + '<br><br>');
        } else {
            finalChunks.push(chunk + '<br><br>');
        }
    }

    let pages = [];
    let currentPage = "";
    let currentWords = 0;

    for (let chunk of finalChunks) {
        let words = countWords(chunk);
        if (currentWords + words > maxWords && currentPage !== "") {
            pages.push({ content: currentPage });
            currentPage = chunk;
            currentWords = words;
        } else {
            currentPage += chunk;
            currentWords += words;
        }
    }
    if (currentPage) pages.push({ content: currentPage });

    if (pages.length === 0) pages.push({ content: htmlContent });
    return pages;
}

async function loadReaderContent() {
    let data = null;
    try {
        const q = query(collection(db, "books"), where("google_id", "==", bookId));
        const snap = await getDocs(q);
        if (!snap.empty) { data = snap.docs[0].data(); }
    } catch (e) {}

    if (!data) {
        try {
            const res = await fetch('Jsol/tac-pham.json');
            const json = await res.json();
            let allBooks = [];

            if (Array.isArray(json)) {
                allBooks = json;
            } else {
                Object.values(json).forEach(category => {
                    if (Array.isArray(category)) {
                        allBooks.push(...category);
                    }
                });
            }
            data = allBooks.find(b => String(b.google_id) === String(bookId));
        } catch (e) { }
    }

    if (data) {
        globalTitle = data.title || "";
        globalAuthor = data.author || "";
        globalDate = data.published_date || "";
        currentGenre = data.genre || "Văn học";
        document.getElementById('header-title').textContent = globalTitle;

        if (data.is_collection) {
            isPoetryCollection = true;
            accumulatedWords = 0;
            currentCollection = data.poems.map((p, index) => ({ ...p, originalIndex: index }));

            document.getElementById('poem-sidebar').style.display = 'flex';
            document.getElementById('nav-buttons').style.display = 'flex';
            document.getElementById('prev-btn').textContent = "Bài trước";
            document.getElementById('next-btn').textContent = "Bài tiếp";

            renderPoemItems(currentCollection);
            displayPoem(startPage < currentCollection.length ? startPage : 0);
        } else {
            isPoetryCollection = false;
            accumulatedWords = 0;
            let totalContent = data.content || data.text || data.noidung || "";
            let totalWordsCheck = countWords(totalContent);

            if (totalWordsCheck > 500) {
                let userFormattedText = formatReadableText(totalContent);
                currentCollection = splitHTMLIntoPages(userFormattedText, 500);

                document.getElementById('poem-sidebar').style.display = 'none';
                document.getElementById('nav-buttons').style.display = 'flex';
                displayPoem(startPage < currentCollection.length ? startPage : 0);
            } else {
                let userFormattedText = formatReadableText(totalContent);
                currentCollection = splitHTMLIntoPages(userFormattedText, 999999);
                document.getElementById('poem-sidebar').style.display = 'none';
                document.getElementById('nav-buttons').style.display = 'none';
                displayPoem(0);
            }
        }
        startTime = Date.now();
    } else {
        document.getElementById('header-title').textContent = "Lỗi tải sách";
        document.getElementById('paper-content').innerHTML = "<p style='text-align:center; margin-top:50px;'>Không tìm thấy nội dung tác phẩm. Vui lòng thử lại sau.</p>";
        document.getElementById('nav-buttons').style.display = 'none';
        const sidebar = document.getElementById('poem-sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }
}

function renderPoemItems(list) {
    const container = document.getElementById('poem-list-container');
    container.innerHTML = list.map((p) => `<div class="poem-item" data-idx="${p.originalIndex}">${p.title}</div>`).join('');
    document.querySelectorAll('.poem-item').forEach(item => {
        item.onclick = () => displayPoem(parseInt(item.dataset.idx));
        if (parseInt(item.dataset.idx) === currentIndex) item.classList.add('active');
    });
}

function updateFocusActionBtn() {
    if (readingMode !== 'focus') return;
    const isFinished = (currentIndex === currentCollection.length - 1);
    const btn = document.getElementById('focus-action-btn');
    if (btn) {
        if (isFinished) {
            btn.textContent = "Đóng sách";
        } else {
            btn.textContent = (focusState.timeLeft <= 0) ? "Nghỉ ngơi" : "Từ bỏ";
        }
    }
}

window.displayPoem = (index) => {
    if (index < 0 || index >= currentCollection.length) return;
    currentIndex = index;
    const p = currentCollection[index];

    if (!readPoemIndices.has(index)) {
        accumulatedWords += countWords(p.content);
        readPoemIndices.add(index);
    }

    if (isPoetryCollection) {
        document.getElementById('paper-title').textContent = p.title;
        document.getElementById('paper-content').innerHTML = formatReadableText(p.content);
        document.getElementById('paper-signature').innerHTML = `<span>${globalAuthor}</span><br>${p.date || ""}`;
        document.querySelectorAll('.poem-item').forEach((el) => {
            el.classList.toggle('active', parseInt(el.dataset.idx) === index);
        });
    } else {
        const pageLabel = currentCollection.length > 1 ? ` (Trang ${index + 1}/${currentCollection.length})` : "";
        document.getElementById('paper-title').textContent = globalTitle + pageLabel;
        document.getElementById('paper-content').innerHTML = p.content;
        document.getElementById('paper-signature').innerHTML = `<span>${globalAuthor}</span><br>${globalDate}`;
    }

    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').disabled = index === currentCollection.length - 1;

    updateFocusActionBtn();

    const mainArea = document.getElementById('main-scroll-area');
    if (mainArea) mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const exitReaderBtn = document.getElementById('exit-reader-btn');
if (exitReaderBtn) {
    exitReaderBtn.onclick = async () => {
        let isFinished = (currentIndex === currentCollection.length - 1);
        if (!isFinished) {
            const isConfirm = await window.showConfirm("Bạn có muốn thoát và lưu điểm?");
            if (!isConfirm) return;
        }
        localStorage.removeItem(FOCUS_KEY);
        await saveProgressAndCalculatePoints(true, `lib.html`);
    };
}

async function saveProgressAndCalculatePoints(isExitClicked = false, redirectUrl = `lib.html`, isSilent = false) {
    const timeSpentSec = (readingMode === 'focus') ? (focusState.readingDuration || 0) : ((Date.now() - startTime) / 1000);
    const standardSpeed = isPoetryCollection ? 2 : 3.3;
    const expectedTime = accumulatedWords / standardSpeed;
    const minTime = expectedTime * 0.6;
    const maxTime = expectedTime * 2.5;

    let isInvalidRead = false;
    if (accumulatedWords > 50 && (timeSpentSec < minTime || timeSpentSec > maxTime)) {
        isInvalidRead = true;
    }

    let pagesRead = readPoemIndices.size;
    let readPoint = pagesRead * 3;
    let isFinished = (currentIndex === currentCollection.length - 1);
    let statusMessage = "";

    if (!isFinished) readPoint = Math.floor(readPoint * 0.3);
    if (isInvalidRead && accumulatedWords > 0) {
        readPoint = Math.floor(readPoint * 0.5);
        statusMessage = isFinished ? `Bạn đã xem đến trang cuối cùng của tác phẩm.` : ``;
        statusMessage += (timeSpentSec < minTime) ? "\n\nNhắc nhở: Bạn lướt trang hơi nhanh đấy nhé!" : "\n\nNhắc nhở: Hình như bạn đang treo máy đi đâu đó?";
    } else if (accumulatedWords > 0) {
        statusMessage = isFinished ? "Tuyệt vời! Bạn đã hoàn thành tác phẩm với nhịp độ đọc cực kỳ chuẩn xác." : `Hệ thống đã lưu lại Trang ${currentIndex + 1} để bạn đọc tiếp lần sau.`;
    } else {
        statusMessage = "Hệ thống đã lưu lại vị trí của bạn.";
    }
    if (readPoint <= 0 && pagesRead > 0) readPoint = 1;

    if (auth.currentUser) {
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userRef, {
                readingProgress: { [bookId]: isFinished ? 0 : currentIndex }
            }, { merge: true });

            if (isFinished && !isInvalidRead) {
                const getCurrentWeekID = () => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    const day = d.getDay();
                    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    const monday = new Date(d.setDate(diff));
                    return monday.toISOString().split('T')[0];
                };

                const bookRef = doc(db, "books", bookId);
                const bookSnap = await getDoc(bookRef);
                const currentWeekId = getCurrentWeekID();
                let updates = { completed_reads: increment(1) };
                
                if (bookSnap.exists()) {
                    const bookData = bookSnap.data();
                    if (bookData.week_id === currentWeekId) {
                        updates.weekly_reads = increment(1);
                    } 
                 
                    else {
                        updates.weekly_reads = 1;
                        updates.week_id = currentWeekId;
                    }
                } else {
                    updates.weekly_reads = 1;
                    updates.week_id = currentWeekId;
                }
                
                await updateDoc(bookRef, updates);
            }

            if (readingMode !== 'focus' && !isSilent) {
                await setDoc(userRef, { readpoints: increment(readPoint) }, { merge: true });
            }
        } catch (e) { }
    }

    if (readingMode === 'focus') {
        focusState.pendingPoints = (focusState.pendingPoints || 0) + readPoint;

        let today = new Date().toDateString();
        if (focusState.lastFertilizerDate !== today) {
            focusState.dailyFertilizerCount = 0;
            focusState.lastFertilizerDate = today;
        }

        if (!isInvalidRead && accumulatedWords > 0) {
            focusState.accumulatedValidSeconds = (focusState.accumulatedValidSeconds || 0) + timeSpentSec;

            let blocksEarned = Math.floor(focusState.accumulatedValidSeconds / 1500);

            if (blocksEarned > 0) {
                let canEarn = 2 - (focusState.dailyFertilizerCount || 0);
                if (canEarn > 0) {
                    let earned = Math.min(blocksEarned, canEarn);
                    focusState.pendingFertilizer = (focusState.pendingFertilizer || 0) + earned;
                    focusState.dailyFertilizerCount = (focusState.dailyFertilizerCount || 0) + earned;
                }
                focusState.accumulatedValidSeconds -= (blocksEarned * 1500);
            }
        }

        focusState.readingDuration = 0;
        saveFocusState();
        accumulatedWords = 0;
        readPoemIndices.clear();
        startTime = Date.now();
    }

    if (isSilent) return;

    if (isExitClicked) {
        await window.showPopup(`${statusMessage}\n\n- Nhận được: +${readPoint} ReadPoints`);
        window.location.href = redirectUrl;
    }
}

let preloadedSuggestHtml = '';
async function preloadSuggestions() {
    try {
        const res = await fetch('Jsol/tac-pham.json');
        const json = await res.json();
        let allBooks = [];

        if (Array.isArray(json)) {
            allBooks = json;
        } else {
            Object.values(json).forEach(category => {
                if (Array.isArray(category)) {
                    allBooks.push(...category);
                }
            });
        }

        const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.google_id, item])).values());
        const others = uniqueBooks.filter(b => String(b.google_id) !== String(bookId)).sort(() => 0.5 - Math.random()).slice(0, 4);

        preloadedSuggestHtml = others.map(b => {
            const cover = b.cover_image || 'https://placehold.co/110x160';
            return `
        <div class="suggest-item" onclick="window.location.href='doc-sach.html?id=${b.google_id}&page=0&mode=focus'">
            <img src="${cover}">
            <p>${b.title}</p>
        </div>
    `;
        }).join('');
    } catch (e) { }
}

// YÊU CẦU 3: LÀM SẠCH STATE KHI QUAY VỀ TỪ POPUP GỢI Ý
function showSuggestPopup() {
    document.getElementById('suggest-popup').style.display = 'flex';
    document.getElementById('suggest-grid-container').innerHTML = preloadedSuggestHtml || 'Đang tải...';
    document.getElementById('close-suggest-btn').onclick = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        localStorage.removeItem(FOCUS_KEY); 
        window.location.href = 'lib.html';
    };
}

const searchInput = document.getElementById('search-poem-input');
if (searchInput) {
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = currentCollection.filter(p => p.title && p.title.toLowerCase().includes(term));
        renderPoemItems(filtered);
    };
}
const prevBtn = document.getElementById('prev-btn');
if (prevBtn) prevBtn.onclick = () => displayPoem(currentIndex - 1);
const nextBtn = document.getElementById('next-btn');
if (nextBtn) nextBtn.onclick = () => displayPoem(currentIndex + 1);

loadReaderContent();

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && isTimerRunning && activeTab === 'focus' && document.body.classList.contains('is-deep-reading')) {
        if (!isProgrammaticExit) {
            window.showPopup("Nhắc nhở: Bạn vừa tự ý thoát toàn màn hình (F11)!\nHãy giữ sự tập trung cao độ nhé.");
        }
    }
    isProgrammaticExit = false;
});

let focusTimerInterval = null;
let focusTimeLeft = focusState.timeLeft;
let isTimerRunning = focusState.isRunning;
let activeTab = focusState.activeTab;

const audioList = ['Audio/Audio1.mp3', 'Audio/Audio2.mp3', 'Audio/Audio3.mp3', 'Audio/Audio4.mp3', 'Audio/Audio5.mp3'];
let audioIndex = 0;
const relaxAudio = new Audio();
relaxAudio.onended = () => {
    audioIndex = (audioIndex + 1) % audioList.length;
    relaxAudio.src = audioList[audioIndex];
    relaxAudio.play().catch(() => { });
};

function updateFocusTimeUI() {
    const timeDisplay = document.getElementById('focus-time-display');
    const miniTimer = document.getElementById('mini-timer');
    const m = Math.floor(focusTimeLeft / 60);
    const s = focusTimeLeft % 60;
    const formatted = `${m}:${s < 10 ? '0' + s : s}`;
    if (timeDisplay) timeDisplay.textContent = formatted;
    if (miniTimer) miniTimer.textContent = formatted;
    updateFocusActionBtn();
}

function applyTabLocks() {
    const tabFocus = document.getElementById('tab-focus');
    const tabBreak = document.getElementById('tab-break');
    if (!tabFocus || !tabBreak) return;

    if (focusState.needsBreak) {
        tabFocus.classList.add('disabled-tab');
        tabBreak.classList.remove('disabled-tab');
        if (activeTab !== 'break') {
            activeTab = 'break';
            focusState.activeTab = 'break';
            focusTimeLeft = 5 * 60;
            focusState.timeLeft = focusTimeLeft;
        }
    } else {
        tabBreak.classList.add('disabled-tab');
        tabFocus.classList.remove('disabled-tab');
        if (activeTab !== 'focus') {
            activeTab = 'focus';
            focusState.activeTab = 'focus';
            focusTimeLeft = 25 * 60;
            focusState.timeLeft = focusTimeLeft;
        }
    }
    saveFocusState();
    updateFocusTimeUI();
}

if (readingMode === 'focus') {
    const focusDashboard = document.getElementById('focus-mode-dashboard');
    const startBtn = document.getElementById('start-deep-read-btn');
    const tabFocus = document.getElementById('tab-focus');
    const tabBreak = document.getElementById('tab-break');
    const exitBtn = document.getElementById('exit-focus-dashboard');
    const focusActionBtn = document.getElementById('focus-action-btn');
    const cheatSkipBtn = document.getElementById('cheat-skip-btn');
    const miniCheatBtn = document.getElementById('mini-cheat-btn');
    const miniTimerBtn = document.getElementById('mini-timer');

    applyTabLocks();

    if (isTimerRunning && focusTimeLeft >= 0) {
        if (activeTab === 'focus') {
            focusDashboard.style.display = 'none';
            document.documentElement.classList.remove('in-focus-dashboard');
            document.body.classList.remove('in-focus-dashboard');
            document.body.classList.add('is-deep-reading');
        } else {
            startBtn.textContent = "Đang nghỉ ngơi";
            startBtn.disabled = true;
            startBtn.style.opacity = "0.5";
            relaxAudio.src = audioList[audioIndex];
            relaxAudio.play().catch(() => { });
        }
        focusTimerInterval = setInterval(focusTick, 1000);
    } else {
        document.documentElement.classList.add('in-focus-dashboard');
        document.body.classList.add('in-focus-dashboard');
        if (focusDashboard) focusDashboard.style.display = 'flex';
        isTimerRunning = false;
        focusState.isRunning = false;
        saveFocusState();
    }

    updateFocusTimeUI();

    function checkPacingAndPopup() {
        let expectedTime = accumulatedWords / (isPoetryCollection ? 2 : 3.3);
        if (accumulatedWords > 50) {
            if (focusState.readingDuration < expectedTime * 0.6) {
                window.showPopup("Nhắc nhở: Bạn đang lướt trang khá nhanh. Hãy chậm lại để cảm nhận trọn vẹn nhé!");
            } else if (focusState.readingDuration > expectedTime * 2.5) {
                window.showPopup("Nhắc nhở: Có vẻ bạn đang đọc khá chậm hoặc đang bận việc khác. Hãy tập trung hơn nhé!");
            } else {
                window.showPopup("Nhịp độ đọc của bạn rất tuyệt vời! Cứ tiếp tục đắm chìm vào thế giới ngôn từ nhé.");
            }
        }
    }

    function focusTick() {
        if (activeTab === 'focus') {
            if (focusTimeLeft > 0) {
                focusTimeLeft--;
                focusState.timeLeft = focusTimeLeft;
                if (focusTimeLeft === 0) {
                    focusState.needsBreak = true;
                    updateFocusActionBtn();
                }
            }

            focusState.readingDuration = (focusState.readingDuration || 0) + 1;
            if (focusState.readingDuration > 0 && focusState.readingDuration % 600 === 0) {
                checkPacingAndPopup();
            }
            saveFocusState();
            updateFocusTimeUI();
        } else {
            if (focusTimeLeft > 0) {
                focusTimeLeft--;
                focusState.timeLeft = focusTimeLeft;
                saveFocusState();
                updateFocusTimeUI();
            } else {
                clearInterval(focusTimerInterval);
                isTimerRunning = false;
                focusState.isRunning = false;
                focusState.needsBreak = false;
                saveFocusState();

                relaxAudio.pause();
                audioIndex = (audioIndex + 1) % audioList.length;
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.style.opacity = "1";
                }

                applyTabLocks();

                window.showPopup("Hết thời gian nghỉ ngơi! Cùng quay lại đọc sách nào.").then(() => {
                    if (tabFocus) tabFocus.click();
                });
            }
        }
    }

    function doGiaTruong() {
        if (isTimerRunning) {
            focusTimeLeft = 1;
            focusState.timeLeft = 1;

            let today = new Date().toDateString();
            if (focusState.lastFertilizerDate !== today) {
                focusState.dailyFertilizerCount = 0;
                focusState.lastFertilizerDate = today;
            }

            if ((focusState.dailyFertilizerCount || 0) < 2) {
                focusState.pendingFertilizer = (focusState.pendingFertilizer || 0) + 1;
                focusState.dailyFertilizerCount = (focusState.dailyFertilizerCount || 0) + 1;
            }

            saveFocusState();
        } else {
            window.showPopup("Bạn phải bấm Bắt đầu trước khi dùng quyền Gia Trưởng nhé!");
        }
    }
    if (cheatSkipBtn) cheatSkipBtn.onclick = doGiaTruong;
    if (miniCheatBtn) miniCheatBtn.onclick = doGiaTruong;

    if (tabFocus) tabFocus.onclick = () => {
        if (isTimerRunning) return;
        if (focusState.needsBreak) {
            window.showPopup("Bạn cần hoàn thành thời gian nghỉ ngơi trước khi bắt đầu phiên đọc mới!");
            return;
        }

        tabFocus.classList.add('active');
        if (tabBreak) tabBreak.classList.remove('active');
        activeTab = 'focus';
        focusState.activeTab = 'focus';
        focusTimeLeft = 25 * 60;
        focusState.timeLeft = focusTimeLeft;
        saveFocusState();

        startBtn.textContent = "Bắt đầu đọc sâu";
        updateFocusTimeUI();
    };

    if (tabBreak) tabBreak.onclick = () => {
        if (isTimerRunning) return;
        tabBreak.classList.add('active');
        if (tabFocus) tabFocus.classList.remove('active');
        activeTab = 'break';
        focusState.activeTab = 'break';
        focusTimeLeft = 5 * 60;
        focusState.timeLeft = focusTimeLeft;
        saveFocusState();

        startBtn.textContent = "Bắt đầu nghỉ ngơi";
        updateFocusTimeUI();
    };

    if (startBtn) startBtn.onclick = () => {
        if (isTimerRunning && activeTab === 'break') return;

        if (!isTimerRunning) {
            isTimerRunning = true;
            focusState.isRunning = true;
            saveFocusState();

            if (activeTab === 'focus') {
                focusDashboard.style.display = 'none';
                document.documentElement.classList.remove('in-focus-dashboard');
                document.body.classList.remove('in-focus-dashboard');
                document.body.classList.add('is-deep-reading');

                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => { });
                }
            } else {
                startBtn.textContent = "Đang nghỉ ngơi";
                startBtn.disabled = true;
                startBtn.style.opacity = "0.5";

                relaxAudio.src = audioList[audioIndex];
                relaxAudio.play().catch(() => { });
            }

            focusTimerInterval = setInterval(focusTick, 1000);
        }
    };

    async function flushPendingPointsAndAlert(showPopup = true) {
        let totalEarnedRP = focusState.pendingPoints || 0;
        let totalEarnedFB = focusState.pendingFertilizer || 0;

        if ((totalEarnedRP > 0 || totalEarnedFB > 0) && auth.currentUser) {
            try {
                const userRef = doc(db, "users", auth.currentUser.uid);
                let updateData = {};
                if (totalEarnedRP > 0) updateData.readpoints = increment(totalEarnedRP);
                if (totalEarnedFB > 0) updateData.phanbon = increment(totalEarnedFB);

                await setDoc(userRef, updateData, { merge: true });

                if (showPopup) {
                    let msg = "Tuyệt vời! Hệ thống đã kết toán phiên tập trung:\n";
                    if (totalEarnedRP > 0) msg += `Nhận được +${totalEarnedRP} ReadPoints\n`;
                    if (totalEarnedFB > 0) msg += `Nhận được +${totalEarnedFB} Phân bón\n`;
                    msg += "Hãy thư giãn và nghỉ ngơi nhé!";
                    await window.showPopup(msg);
                }
            } catch (e) { }
        } else if (showPopup) {
            await window.showPopup(`Bạn đã hoàn thành phiên tập trung.\nHãy thư giãn và nghỉ ngơi nhé!`);
        }

        focusState.pendingPoints = 0;
        focusState.pendingFertilizer = 0;
        saveFocusState();
    }

    if (focusActionBtn) {
        focusActionBtn.onclick = async () => {
            const action = focusActionBtn.textContent;

            if (action === "Từ bỏ") {
                const isConfirm = await window.showConfirm("Bạn có chắc chắn muốn từ bỏ việc đọc không?");
                if (isConfirm) {
                    isProgrammaticExit = true;
                    if (document.fullscreenElement) await document.exitFullscreen().catch(() => { });
                    localStorage.removeItem(FOCUS_KEY); 
                    window.location.href = `lib.html`;
                }
            }
            else if (action === "Nghỉ ngơi") {
                await saveProgressAndCalculatePoints(false, null, true);

                isProgrammaticExit = true;
                document.body.classList.remove('is-deep-reading');

                clearInterval(focusTimerInterval);
                isTimerRunning = false;
                focusState.isRunning = false;
                focusState.needsBreak = true;
                saveFocusState();

                document.documentElement.classList.add('in-focus-dashboard');
                document.body.classList.add('in-focus-dashboard');
                focusDashboard.style.display = 'flex';

                applyTabLocks();
                if (tabBreak) tabBreak.click();
            }
            else if (action === "Đóng sách") {
                isProgrammaticExit = true;

                preloadSuggestions();
                await saveProgressAndCalculatePoints(false, null, true);

                await window.showReflectionPopup();

                clearInterval(focusTimerInterval);
                isTimerRunning = false;
                focusState.isRunning = false;
                saveFocusState();

                document.body.classList.remove('is-deep-reading');
                document.documentElement.classList.add('in-focus-dashboard');
                document.body.classList.add('in-focus-dashboard');
                focusDashboard.style.display = 'flex';

                applyTabLocks();

                const startBtnLocal = document.getElementById('start-deep-read-btn');
                if (startBtnLocal && !focusState.needsBreak) startBtnLocal.textContent = "Đọc tiếp";

                showSuggestPopup();
            }
        };
    }

    // YÊU CẦU 3: RESET LẠI STATE KHI BẤM NÚT THOÁT
    if (exitBtn) exitBtn.onclick = async () => {
        const isConfirm = await window.showConfirm("Thoát chế độ Focus và quay về Thư viện?");
        if (isConfirm) {
            await flushPendingPointsAndAlert(true);

            focusDashboard.style.display = 'none';
            relaxAudio.pause();

            document.documentElement.classList.remove('in-focus-dashboard');
            document.body.classList.remove('in-focus-dashboard');
            document.body.classList.remove('is-deep-reading');

            if (focusTimerInterval) clearInterval(focusTimerInterval);
            isProgrammaticExit = true;
            if (document.fullscreenElement) await document.exitFullscreen().catch(() => { });

            localStorage.removeItem(FOCUS_KEY); 
            window.location.href = `lib.html`;
        }
    };
}
