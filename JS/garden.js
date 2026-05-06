import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

const actionLoader = document.createElement('div');
actionLoader.id = 'action-loader';
actionLoader.innerHTML = '<div class="action-spinner"></div>';
document.body.appendChild(actionLoader);

window.showActionLoader = () => { document.getElementById('action-loader').style.display = 'flex'; };
window.hideActionLoader = () => { document.getElementById('action-loader').style.display = 'none'; };

const levelUpAudio = new Audio('Audio/chill.mp3');
levelUpAudio.volume = 0.5;

const THANH_QUOTES = [
    "Chào cậu hôm nay đọc được mấy trang sách rồi",
    "Trời đẹp thế này ra vườn đọc sách là nhất đấy",
    "Cậu có biết cây cũng thích nghe cậu đọc sách không",
    "Nhớ uống đủ nước như cách cậu tưới cây nhé",
    "Khu vườn này là của cậu hãy chăm sóc nó thật tốt",
    "Hôm nay cậu thấy thế nào cười lên cái xem nào",
    "Mỗi trang sách là một giọt nước tưới mát tâm hồn",
    "Cậu đang đọc cuốn sách gì thế kể tớ nghe với",
    "Cố gắng lên thành quả sẽ đến sớm thôi",
    "Tớ đứng đây cả ngày chỉ để đợi cậu vào thăm đấy",
    "Đừng thức khuya quá nhé hại sức khỏe lắm",
    "Cây đang lớn nhanh lắm giống như kiến thức của cậu vậy",
    "Focus Mode giúp cậu tập trung hơn đấy thử chưa",
    "Thu hoạch hoa xong nhớ khoe với mọi người nhé",
    "Cậu là người chăm chỉ nhất mà tớ từng biết",
    "Sách hay cũng như phân bón tốt giúp ta lớn khôn",
    "Đừng quên nghỉ ngơi sau những giờ học căng thẳng",
    "Tớ tuy hơi crazy nhưng tớ rất thích đọc sách",
    "Gieo một hạt mầm gặt một rừng hoa",
    "Tớ cá là cây này nở ra sẽ đẹp lắm đây",
    "Nếu mệt mỏi hãy nhắm mắt lại và nghe tiếng chim hót",
    "Cậu ơi có con sâu nào lảng vảng ở đây không",
    "Tớ đứng gác vườn cho cậu rồi yên tâm đi học đi",
    "Kỷ luật làm nên sự tự do cậu làm tốt lắm",
    "Đọc sách không chỉ để biết mà còn để hiểu",
    "Cậu có thấy tớ đẹp trai không hì hì",
    "Chăm cây cũng như chăm sóc chính bản thân mình vậy",
    "Thấy tớ đứng đây có ngầu không",
    "BloomRead tự hào vì có một người dùng như cậu",
    "Trồng cây khó một giữ cây sống khó mười",
    "Một ngày không đọc sách là một ngày lãng phí",
    "Cậu có muốn uống trà cùng tớ không",
    "Hãy để những muộn phiền tan biến theo gió",
    "Hôm nay cậu làm rất tốt tớ ghi nhận điều đó",
    "Kiến thức là hạt giống hành động là nước tưới",
    "Vườn hoa này sẽ sớm rực rỡ sắc màu thôi",
    "Đừng bỏ cuộc khi gặp khó khăn nhé tớ luôn ở đây",
    "Tớ thích nhìn cậu lúc tập trung đọc sách",
    "Hôm nay trời xanh mây trắng rất hợp để trồng cây",
    "Chạm vào tớ thêm lần nữa xem tớ nói gì nào"
];

window.defaultGardenText = "Cậu chọn hạt giống đi nào";

function updateThanhSpeech(msg, type = 'success') {
    const seedHint = document.getElementById('seed-hint');
    if (!seedHint) return;

    seedHint.textContent = msg;

    if (type === 'error') {
        seedHint.style.color = '#ef4444';
        seedHint.style.borderColor = '#ef4444';
    } else if (type === 'warning') {
        seedHint.style.color = '#F59E0B';
        seedHint.style.borderColor = '#F59E0B';
    } else {
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
    }

    if (seedHint.timeoutId) clearTimeout(seedHint.timeoutId);

    seedHint.timeoutId = setTimeout(() => {
        seedHint.textContent = window.defaultGardenText;
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
        seedHint.timeoutId = null;
    }, 4500);
}

window.showConfirm = function (msg) {
    return new Promise((resolve) => {
        let confirmBox = document.getElementById('custom-confirm-garden');
        if (!confirmBox) {
            confirmBox = document.createElement('div');
            confirmBox.id = 'custom-confirm-garden';
            confirmBox.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100000; display: none; justify-content: center; align-items: center; backdrop-filter: blur(4px);";
            confirmBox.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s ease;">
                    <div id="confirm-msg-text-garden" style="font-size: 16px; margin-bottom: 25px; color: #333; line-height: 1.5; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-weight: 600;"></div>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="btn-confirm-no-garden" style="background: #9CA3AF; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Hủy</button>
                        <button id="btn-confirm-yes-garden" style="background: #16A34A; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Đồng ý</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmBox);
        }
        document.getElementById('confirm-msg-text-garden').textContent = msg;
        confirmBox.style.display = 'flex';

        document.getElementById('btn-confirm-yes-garden').onclick = () => {
            confirmBox.style.display = 'none';
            resolve(true);
        };
        document.getElementById('btn-confirm-no-garden').onclick = () => {
            confirmBox.style.display = 'none';
            resolve(false);
        };
    });
};

let currentUser = null;
let userData = {};
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
const MAX_WATER = 16;
const MAX_FERTILIZER = 3;

const PLANT_STAGES_CONFIG = {
    'Img/BrokenPot.png': [
        { threshold: 0, img: 'Img/SunFlower/BrokenPot_Seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/BrokenPot_Seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/BrokenPot_Seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/BrokenPot_Seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/BrokenPot_Seed4.png', label: "NỞ HOA" }
    ],
    'Img/NormalPot.png': [
        { threshold: 0, img: 'Img/SunFlower/NormalPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/NormalPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/NormalPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/NormalPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/NormalPot_seed4.png', label: "NỞ HOA" }
    ],
    'Img/GoldenPot.png': [
        { threshold: 0, img: 'Img/SunFlower/GoldenPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/GoldenPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/GoldenPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/GoldenPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/GoldenPot_seed4.png', label: "NỞ HOA" }
    ],
    'Img/CoderPot.png': [
        { threshold: 0, img: 'Img/SunFlower/NormalPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/NormalPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/NormalPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/NormalPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/NormalPot_seed4.png', label: "NỞ HOA" }
    ]
};

const ITEM_DB = {
    's1': { name: 'Hoa hướng dương', img: 'Img/SunFlower/Seed.png', type: 'seed' },
    'p1': { name: 'Chậu Thường', img: 'Img/NormalPot.png', type: 'pot' },
    'p2': { name: 'Chậu Vàng', img: 'Img/GoldenPot.png', type: 'pot' },
    'p3': { name: 'Chậu Của Coder', img: 'Img/CoderPot.png', type: 'pot' },
    'b1': { name: 'Khu vườn ban mai', img: 'Img/MinhQuanSeed.jpg', type: 'bg' },
    'b2': { name: 'Rừng đêm huyền bí', img: 'Img/MinhQuanSeed.jpg', type: 'bg' },
    'w1': { name: 'Bình Nước', img: 'Img/nuoc.png', type: 'tool' },
    'f1': { name: 'Phân Bón', img: 'Img/phanbon.png', type: 'tool' }
};

function setupThanhCharacter() {
    const mainBg = document.getElementById('main-bg');
    if (!mainBg) return;

    let thanhContainer = document.getElementById('thanh-container');
    if (!thanhContainer) {
        thanhContainer = document.createElement('div');
        thanhContainer.id = 'thanh-container';

        const seedHint = document.getElementById('seed-hint');
        if (seedHint) {
            thanhContainer.appendChild(seedHint);
        }

        const crazyThanh = document.createElement('img');
        crazyThanh.id = 'crazy-thanh';
        crazyThanh.src = 'Img/crazy_thanh.png';
        crazyThanh.onerror = function () { this.style.display = 'none'; };
        thanhContainer.appendChild(crazyThanh);

        mainBg.appendChild(thanhContainer);

        crazyThanh.onclick = () => {
            if (userData.plantState !== 'dead' && userData.plantedSeed) {
                const randomQuote = THANH_QUOTES[Math.floor(Math.random() * THANH_QUOTES.length)];
                updateThanhSpeech(randomQuote, "success");
            }
        };
    }
}

function initCareActions() {
    const potWrapper = document.getElementById('pot-wrapper');
    if (!document.getElementById('care-actions')) {
        const careDiv = document.createElement('div');
        careDiv.id = 'care-actions';
        careDiv.className = 'care-actions';
        careDiv.innerHTML = `
            <button id="btn-water" class="btn-care"><img src="Img/nuoc.png"></button>
            <button id="btn-fertilize" class="btn-care"><img src="Img/phanbon.png"></button>
        `;
        potWrapper.appendChild(careDiv);

        document.getElementById('btn-water').onclick = async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            careDiv.classList.remove('show');

            if (!userData.inventory['w1'] || userData.inventory['w1'] <= 0) {
                const isConfirm = await window.showConfirm("Cậu hết Nước mất rồi có muốn ghé Cửa Hàng mua thêm không");
                if (isConfirm) window.location.href = 'shop.html';
                return;
            }

            if (userData.plantState === 'dead') {
                updateThanhSpeech("Cây đã chết úng rồi cậu nên nhổ để trồng cây mới đi", "error");
                return;
            }

            window.showActionLoader();
            const todayStr = new Date().toLocaleDateString('vi-VN');
            const now = Date.now();

            if (userData.plantState === 'overwatered') {
                if (now - userData.overwateredTime <= FORTY_EIGHT_HOURS) {
                    userData.plantState = 'dead';
                    userData.inventory['w1'] -= 1;
                    if (userData.inventory['w1'] <= 0) delete userData.inventory['w1'];

                    updateGardenVisuals();
                    renderInventoryUI();
                    window.hideActionLoader();
                    updateThanhSpeech("Cây đã chết úng vì cậu tưới quá tay rồi", "error");

                    updateDoc(doc(db, "users", currentUser.uid), {
                        plantState: 'dead', inventory: userData.inventory
                    }).catch(e => console.error(e));

                    return;
                } else {
                    userData.plantState = 'normal';
                    userData.waterCountToday = 0;
                }
            }

            if (userData.lastWaterDateStr !== todayStr) {
                userData.waterCountToday = 0;
                userData.lastWaterDateStr = todayStr;
            }

            userData.waterCountToday += 1;
            userData.inventory['w1'] -= 1;
            if (userData.inventory['w1'] <= 0) delete userData.inventory['w1'];
            userData.lastWatered = now;

            if (userData.waterCountToday > 4) {
                userData.plantState = 'overwatered';
                userData.overwateredTime = now;

                updateGardenVisuals();
                renderInventoryUI();
                updateThanhSpeech("Dừng lại cậu tưới ngập gốc cây rồi kìa", "error");

                updateDoc(doc(db, "users", currentUser.uid), {
                    inventory: userData.inventory, lastWatered: now, lastWaterDateStr: todayStr,
                    waterCountToday: userData.waterCountToday, plantState: 'overwatered', overwateredTime: now
                }).catch(e => console.error(e));

            } else {
                updateGardenVisuals();
                renderInventoryUI();
                updateThanhSpeech("Cảm ơn cậu đã tưới nước cây trông tươi tắn lắm", "success");

                updateDoc(doc(db, "users", currentUser.uid), {
                    inventory: userData.inventory, lastWatered: now, lastWaterDateStr: todayStr,
                    waterCountToday: userData.waterCountToday, plantState: 'normal'
                }).catch(e => console.error(e));
            }
            window.hideActionLoader();
        };

        document.getElementById('btn-fertilize').onclick = async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            careDiv.classList.remove('show');

            if (!userData.phanbon || userData.phanbon <= 0) {
                const isConfirm = await window.showConfirm("Cậu hết Phân bón rồi có muốn tới Thư Viện đọc sách kiếm thêm không");
                if (isConfirm) window.location.href = 'lib.html';
                return;
            }

            if (userData.plantState === 'dead') {
                updateThanhSpeech("Cây chết rồi bón phân cũng vô ích thôi cậu ạ", "error");
                return;
            }

            const todayStr = new Date().toLocaleDateString('vi-VN');
            if (userData.lastFertilizerDateStr === todayStr) {
                updateThanhSpeech("Hôm nay cậu đã bón phân rồi mỗi ngày chỉ 1 lần thôi nhé", "warning");
                return;
            }

            if (userData.fertilizerTime) {
                updateThanhSpeech("Cây đang tiêu hóa phân bón đợt trước cậu đợi thêm chút nhé", "warning");
                return;
            }

            window.showActionLoader();
            userData.phanbon -= 1;
            userData.fertilizerTime = Date.now();
            userData.lastFertilizerDateStr = todayStr;

            updateGardenVisuals();
            renderInventoryUI();
            updateThanhSpeech("Đã bón phân cây sẽ lớn thêm sau 30 phút nữa", "success");

            updateDoc(doc(db, "users", currentUser.uid), {
                phanbon: userData.phanbon,
                fertilizerTime: userData.fertilizerTime,
                lastFertilizerDateStr: userData.lastFertilizerDateStr
            }).catch(e => console.error(e));
            
            window.hideActionLoader();
        };
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const cheatBtn = document.getElementById('cheat-btn');
        if (user.email === "ricute069@gmail.com") {
            if (cheatBtn) {
                cheatBtn.style.display = 'block';
                cheatBtn.onclick = handleCheatGrowth;
            }
        }
        setupThanhCharacter();
        initCareActions();
        await fetchAndCheckUser();
    } else {
        currentUser = null;
        const loader = document.getElementById('page-loader');
        if (loader) loader.classList.add('hidden-loader');
        const checkModalInterval = setInterval(() => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                clearInterval(checkModalInterval);
                loginModal.style.display = 'flex';
                const closeBtn = document.querySelector('.close-login-btn');
                if (closeBtn) closeBtn.onclick = () => { if (!currentUser) window.location.href = 'index.html'; };
            }
        }, 100);
    }
});

async function fetchAndCheckUser() {
    const userRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        userData = docSnap.data();
        if (!userData.inventory) userData.inventory = {};
        if (userData.plantProgress === undefined) userData.plantProgress = 0;
        if (!userData.plantState) userData.plantState = 'normal';
    } else {
        userData = { flowers: 0, seeds: 1, inventory: {}, plantProgress: 0, plantState: 'normal', waterCountToday: 0, phanbon: 0 };
        await setDoc(userRef, userData);
    }

    if (userData.inventory['w1'] > MAX_WATER) userData.inventory['w1'] = MAX_WATER;
    if (userData.phanbon > MAX_FERTILIZER) userData.phanbon = MAX_FERTILIZER;

    updateGardenVisuals();
    renderInventoryUI();
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden-loader');

    startFertilizerLoop();
    startThanhAutoTalk();
}

function startFertilizerLoop() {
    setInterval(() => {
        if (currentUser && userData && userData.plantedSeed && userData.fertilizerTime && userData.plantState !== 'dead') {
            const timePassed = Date.now() - userData.fertilizerTime;
            const THIRTY_MINUTES = 30 * 60 * 1000;

            if (timePassed >= THIRTY_MINUTES) {
                userData.plantProgress = Math.min((userData.plantProgress || 0) + 10, 100);
                userData.fertilizerTime = null;

                updateGardenVisuals();

                updateDoc(doc(db, "users", currentUser.uid), {
                    plantProgress: userData.plantProgress,
                    fertilizerTime: null
                }).catch(e => console.error(e));
            }
        }
    }, 10000);
}

let lastReminderWasCare = false;

function startThanhAutoTalk() {
    setInterval(() => {
        const seedHint = document.getElementById('seed-hint');
        if (seedHint && seedHint.timeoutId) return;

        if (currentUser && userData) {
            let msg = window.defaultGardenText;

            if (userData.plantedSeed && userData.plantState === 'normal' && userData.plantProgress < 100) {
                const todayStr = new Date().toLocaleDateString('vi-VN');
                let needsWater = !userData.waterCountToday || userData.waterCountToday < 1;
                let needsFertilizer = userData.lastFertilizerDateStr !== todayStr;

                if (needsWater || needsFertilizer) {
                    if (lastReminderWasCare) {
                        msg = "Hãy thử bấm vào chậu đi";
                        lastReminderWasCare = false;
                    } else {
                        if (needsWater && needsFertilizer) {
                            msg = "Cậu ơi cây khát nước và đói phân bón kìa";
                        } else if (needsWater) {
                            msg = "Cây đang cần nước đấy cậu tưới cho nó đi";
                        } else if (needsFertilizer) {
                            msg = "Cậu vào Thư Viện kiếm phân bón cho cây mau lớn nhé";
                        }
                        lastReminderWasCare = true;
                    }
                } else {
                    msg = THANH_QUOTES[Math.floor(Math.random() * THANH_QUOTES.length)];
                    lastReminderWasCare = false;
                }
            }

            if (seedHint) {
                seedHint.textContent = msg;
                seedHint.style.color = '#16A34A';
                seedHint.style.borderColor = '#16A34A';
            }
        }
    }, 8000);
}

function updateGardenVisuals() {
    const mainBg = document.getElementById('main-bg');
    const centerPot = document.getElementById('center-pot');
    const seedHint = document.getElementById('seed-hint');
    const potWrapper = document.getElementById('pot-wrapper');
    const btnFertilize = document.getElementById('btn-fertilize');

    if (mainBg) {
        mainBg.style.backgroundImage = `url('${userData.equippedBg || 'Img/AnhBackGroundGarden.png'}')`;
        mainBg.style.position = 'relative';
    }

    if (centerPot) centerPot.classList.remove('withered-plant', 'overwatered-plant', 'dead-plant');

    let currentPotImg = userData.equippedPot || 'Img/BrokenPot.png';
    let currentPlantStageImg = currentPotImg;
    let currentLabel = "Cậu chọn hạt giống đi nào";

    if (userData.plantedSeed) {
        if (potWrapper) potWrapper.classList.add('is-planted');

        const todayStr = new Date().toLocaleDateString('vi-VN');
        if (btnFertilize) {
            if (userData.lastFertilizerDateStr === todayStr) {
                btnFertilize.style.display = 'none';
            } else {
                btnFertilize.style.display = 'flex';
            }
        }

        const progress = userData.plantProgress || 0;
        const stages = PLANT_STAGES_CONFIG[currentPotImg] || PLANT_STAGES_CONFIG['Img/BrokenPot.png'];

        let currentStage = stages[0];
        for (let i = 0; i < stages.length; i++) {
            if (progress >= stages[i].threshold) {
                currentStage = stages[i];
            } else { break; }
        }

        currentPlantStageImg = currentStage.img;

        if (userData.plantState === 'dead') {
            if (centerPot) centerPot.classList.add('dead-plant');
            currentLabel = "Cây đã chết mất rồi";
        }
        else if (userData.plantState === 'overwatered') {
            if (Date.now() - userData.overwateredTime > FORTY_EIGHT_HOURS) {
                userData.plantState = 'normal';
                userData.waterCountToday = 0;
            } else {
                if (centerPot) centerPot.classList.add('overwatered-plant');
                currentLabel = "Cây sắp úng rồi cậu dừng tưới đi";
            }
        }

        if (userData.plantState === 'normal') {
            let isWithered = false;
            if (userData.lastWatered && (Date.now() - userData.lastWatered > FORTY_EIGHT_HOURS)) {
                isWithered = true;
            }

            if (isWithered && progress < 100) {
                if (centerPot) centerPot.classList.add('withered-plant');
                currentLabel = "Cây đang héo kìa cậu tưới nước đi";
            } else {
                if (progress >= 100) {
                    currentLabel = "Hoa nở rồi cậu thu hoạch đi";
                } else {
                    currentLabel = "Chào cậu nhớ chăm sóc cây mỗi ngày nhé";
                }
            }
        }

        if (userData.plantState !== 'dead' && userData.lastStageLabel && userData.lastStageLabel !== currentStage.label && progress > 0) {
            levelUpAudio.play().catch(e => console.log(""));
        }
        userData.lastStageLabel = currentStage.label;

    } else {
        if (potWrapper) potWrapper.classList.remove('is-planted');
        currentLabel = "Cậu chọn hạt giống đi nào";
        userData.lastStageLabel = null;
    }

    if (centerPot) centerPot.src = currentPlantStageImg;
    window.defaultGardenText = currentLabel;

    if (seedHint && !seedHint.timeoutId) {
        seedHint.textContent = currentLabel;
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
    }
}

async function handleCheatGrowth() {
    userData.inventory['w1'] = Math.min((userData.inventory['w1'] || 0) + 5, MAX_WATER);
    userData.phanbon = Math.min((userData.phanbon || 0) + 2, MAX_FERTILIZER);

    if (userData.plantedSeed && userData.plantState !== 'dead') {
        userData.plantProgress = Math.min((userData.plantProgress || 0) + 50, 100);
        userData.lastFertilizerDateStr = null;

        if (userData.plantState === 'overwatered') {
            userData.plantState = 'normal';
            userData.waterCountToday = 0;
        }
    }

    updateGardenVisuals();
    renderInventoryUI();
    updateThanhSpeech("Đã tua thời gian cây lại cần chăm sóc rồi đấy", "success");

    updateDoc(doc(db, "users", currentUser.uid), {
        inventory: userData.inventory,
        phanbon: userData.phanbon,
        plantProgress: userData.plantProgress || 0,
        plantState: userData.plantState || 'normal',
        lastFertilizerDateStr: null
    }).catch(e => console.error(e));
}

const bagIcon = document.getElementById('bag-icon');
const invWrapper = document.getElementById('inventory-wrapper');
const closeInvBtn = document.getElementById('close-inv-btn');
const potWrapper = document.getElementById('pot-wrapper');

if (bagIcon) {
    bagIcon.onclick = () => {
        if (!currentUser) {
            if (window.showPopup) window.showPopup("Bạn cần đăng nhập để xem túi đồ!");
            return;
        }
        const isOpen = invWrapper.classList.toggle('show');
        bagIcon.src = isOpen ? 'Img/bag_opened.png' : 'Img/bag_closed.png';
        if (isOpen) renderInventoryUI();
    };
}

if (closeInvBtn) {
    closeInvBtn.onclick = () => {
        invWrapper.classList.remove('show');
        bagIcon.src = 'Img/bag_closed.png';
    };
}

if (potWrapper) {
    potWrapper.onclick = async () => {
        if (!currentUser) return;

        if (userData.plantState === 'dead') {
            const isConfirm = await window.showConfirm("Cây đã chết do úng nước. Cậu có muốn nhổ bỏ để trồng cây mới không?");
            if (isConfirm) {
                window.showActionLoader();
                userData.plantedSeed = null; userData.plantProgress = 0; userData.plantState = 'normal'; userData.waterCountToday = 0; userData.lastFertilizerDateStr = null;
                updateGardenVisuals();
                updateDoc(doc(db, "users", currentUser.uid), {
                    plantedSeed: null, plantProgress: 0, plantState: 'normal', waterCountToday: 0, lastFertilizerDateStr: null
                }).then(() => window.hideActionLoader()).catch(e => {
                    console.error(e); window.hideActionLoader();
                });
            }
            return;
        }

        if (!userData.plantedSeed) {
            invWrapper.classList.add('show');
            bagIcon.src = 'Img/bag_opened.png';
            window.switchInvTab('inv-seeds', document.querySelector('.inv-tab'));
            renderInventoryUI();
        } else {
            if (userData.plantProgress >= 100 && userData.plantState !== 'dead') {
                const isConfirm = await window.showConfirm("Cậu có muốn thu hoạch bông hoa này để đóng góp cho cộng đồng không?");
                if (isConfirm) {
                    window.showActionLoader();
                    userData.plantedSeed = null; userData.plantProgress = 0; userData.fertilizerTime = null; userData.waterCountToday = 0; userData.lastFertilizerDateStr = null;

                    updateGardenVisuals();
                    renderInventoryUI();
                    updateThanhSpeech("Thu hoạch thành công cám ơn cậu nha", "success");

                    setDoc(doc(db, "server", "stats"), {
                        totalFlowers: increment(1), realFlowers: increment(1)
                    }, { merge: true }).catch(e => console.error(e));

                    updateDoc(doc(db, "users", currentUser.uid), {
                        plantedSeed: null, plantProgress: 0, fertilizerTime: null, waterCountToday: 0, plantState: 'normal', lastFertilizerDateStr: null
                    }).then(() => window.hideActionLoader()).catch(e => {
                        updateThanhSpeech("Có lỗi xảy ra cậu kiểm tra lại mạng xem sao", "error");
                        window.hideActionLoader();
                    });
                }
            } else if (userData.plantState !== 'dead') {
                const careActions = document.getElementById('care-actions');
                if (careActions) careActions.classList.toggle('show');
            }
        }
    };
}

window.switchInvTab = (tabId, btnElement) => {
    document.querySelectorAll('.inv-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.inv-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
};

window.handleToolClick = async (toolId) => {
    invWrapper.classList.remove('show');
    bagIcon.src = 'Img/bag_closed.png';

    if (toolId === 'w1') {
        const confirm = await window.showConfirm("Cậu có muốn đến Cửa Hàng để mua thêm Nước không?");
        if (confirm) window.location.href = 'shop.html';
    } else if (toolId === 'f1') {
        const confirm = await window.showConfirm("Cậu có muốn đến Thư Viện để đọc sách và nhận thêm Phân bón không?");
        if (confirm) window.location.href = 'lib.html';
    }
};

function renderInventoryUI() {
    const seedContainer = document.getElementById('inv-seeds');
    const potContainer = document.getElementById('inv-pots');
    const bgContainer = document.getElementById('inv-bgs');

    const tabs = document.querySelectorAll('.inv-tab');
    if (tabs.length > 1) tabs[1].textContent = 'CÔNG CỤ';

    let htmlSeeds = '', htmlPots = '', htmlBgs = '';
    if (userData.seeds > 0 && !userData.inventory['s1']) userData.inventory['s1'] = userData.seeds;

    let wCount = Math.min((userData.inventory['w1'] || 0), MAX_WATER);
    htmlPots += `
        <div class="inv-item-card">
            <img src="${ITEM_DB['w1'].img}" class="inv-item-img">
            <div class="inv-item-name">${ITEM_DB['w1'].name}</div>
            <div class="inv-item-qty">Số lượng: ${wCount}/${MAX_WATER}</div>
            <button class="btn-use" onclick="handleToolClick('w1')">CÁCH NHẬN</button>
        </div>
    `;

    let fCount = Math.min((userData.phanbon || 0), MAX_FERTILIZER);
    htmlPots += `
        <div class="inv-item-card">
            <img src="${ITEM_DB['f1'].img}" class="inv-item-img">
            <div class="inv-item-name">${ITEM_DB['f1'].name}</div>
            <div class="inv-item-qty">Số lượng: ${fCount}/${MAX_FERTILIZER}</div>
            <button class="btn-use" onclick="handleToolClick('f1')">CÁCH NHẬN</button>
        </div>
    `;

    for (const [id, count] of Object.entries(userData.inventory)) {
        if (!ITEM_DB[id] || !count || id === 'w1' || id === 'f1') continue;
        const item = ITEM_DB[id];

        let isEquipped = (item.type === 'pot' && userData.equippedPot === item.img) ||
            (item.type === 'bg' && userData.equippedBg === item.img);

        let btnAction = isEquipped ? 'unequip' : item.img;
        let btnText = "";
        let btnClass = isEquipped ? 'btn-use btn-unequip' : 'btn-use';
        let isDisabled = false;

        if (item.type === 'seed') {
            if (userData.plantedSeed) {
                btnText = "ĐANG TRỒNG"; isDisabled = true; btnClass = 'btn-use btn-unequip';
            } else { btnText = "GIEO HẠT"; }
        } else {
            btnText = isEquipped ? 'GỠ BỎ' : 'DÙNG';
        }

        const cardHtml = `
            <div class="inv-item-card">
                <img src="${item.img}" class="inv-item-img">
                <div class="inv-item-name">${item.name}</div>
                ${(item.type === 'seed') ? `<div class="inv-item-qty">Số lượng: ${count}</div>` : ''}
                <button class="${btnClass}" ${isDisabled ? 'disabled' : ''} onclick="useItem('${id}', '${item.type}', '${btnAction}')">
                    ${btnText}
                </button>
            </div>
        `;

        if (item.type === 'seed') htmlSeeds += cardHtml;
        else if (item.type === 'pot') htmlPots += cardHtml;
        else if (item.type === 'bg') htmlBgs += cardHtml;
    }

    if (seedContainer) seedContainer.innerHTML = htmlSeeds || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Túi đồ trống cậu ghé Cửa Hàng nhé</p>';
    if (potContainer) potContainer.innerHTML = htmlPots;
    if (bgContainer) bgContainer.innerHTML = htmlBgs || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Chưa có hình nền nào</p>';
}

window.useItem = async (id, type, actionPath) => {
    if (!currentUser) return;
    window.showActionLoader();

    if (type === 'seed') {
        if (invWrapper) invWrapper.classList.remove('show');
        if (bagIcon) bagIcon.src = 'Img/bag_closed.png';

        updateThanhSpeech(`Đã gieo hạt nhớ tưới nước thường xuyên nhé`, 'success');

        userData.plantedSeed = ITEM_DB[id].img;
        userData.seeds -= 1;
        userData.inventory[id] -= 1;
        userData.plantProgress = 0;
        userData.lastWatered = Date.now();
        userData.fertilizerTime = null;
        userData.plantState = 'normal';
        userData.waterCountToday = 0;
        userData.lastFertilizerDateStr = null;

        if (userData.inventory[id] <= 0) delete userData.inventory[id];

        updateGardenVisuals();
        renderInventoryUI();

        updateDoc(doc(db, "users", currentUser.uid), {
            plantedSeed: ITEM_DB[id].img, seeds: userData.seeds, inventory: userData.inventory,
            plantProgress: userData.plantProgress, lastWatered: userData.lastWatered,
            fertilizerTime: null, plantState: 'normal', waterCountToday: 0, lastFertilizerDateStr: null
        }).then(() => window.hideActionLoader()).catch(e => { console.error(e); window.hideActionLoader(); });
    }
    else if (type === 'pot') {
        const newPot = actionPath === 'unequip' ? 'Img/BrokenPot.png' : actionPath;
        userData.equippedPot = newPot === 'Img/BrokenPot.png' ? null : newPot;
        updateGardenVisuals();
        renderInventoryUI();
        updateDoc(doc(db, "users", currentUser.uid), { equippedPot: newPot === 'Img/BrokenPot.png' ? null : newPot })
            .then(() => window.hideActionLoader()).catch(e => { console.error(e); window.hideActionLoader(); });
    }
    else if (type === 'bg') {
        const newBg = actionPath === 'unequip' ? 'Img/AnhBackGroundGarden.png' : actionPath;
        userData.equippedBg = newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg;
        updateGardenVisuals();
        renderInventoryUI();
        updateDoc(doc(db, "users", currentUser.uid), { equippedBg: newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg })
            .then(() => window.hideActionLoader()).catch(e => { console.error(e); window.hideActionLoader(); });
    }
};

onSnapshot(doc(db, "server", "stats"), (docSnap) => {
    let celebrateUntil = 0, realFlowers = 0;
    if (docSnap.exists()) {
        celebrateUntil = docSnap.data().celebrateUntil || 0;
        realFlowers = docSnap.data().realFlowers || 0;
    }
    const now = Date.now();
    let overlay = document.getElementById('celebration-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'celebration-overlay';
        overlay.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(22, 163, 74, 0.96); z-index: 100000; justify-content: center; align-items: center; flex-direction: column; color: white; text-align: center; backdrop-filter: blur(8px); animation: fadeIn 0.5s ease;";
        overlay.innerHTML = `
            <h1 style="font-size: 55px; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); padding: 0 20px;">CHIẾN DỊCH THÀNH CÔNG</h1>
            <p style="font-size: 26px; max-width: 900px; line-height: 1.5; padding: 0 20px;">Cộng đồng BloomRead vừa gom đủ 300 đóa hoa ảo. Một phần quà thiện nguyện thực tế mang tên dự án chuẩn bị được gửi đi</p>
            <p style="font-size: 28px; margin-top: 40px; color: #FDE047;">Tổng số hoa thực tế đã quyên góp: <span id="real-flowers-count" style="font-size: 36px; text-decoration: underline;">0</span> bông</p>
            <p style="font-size: 18px; margin-top: 40px; opacity: 0.9; background: rgba(0,0,0,0.2); padding: 10px 20px; border-radius: 50px;" id="celeb-timer">Hệ thống sẽ đếm lại từ đầu sau: 05:00</p>
        `;
        document.body.appendChild(overlay);
    }
    if (celebrateUntil > now) {
        overlay.style.display = 'flex';
        const countSpan = document.getElementById('real-flowers-count');
        if (countSpan) countSpan.textContent = realFlowers;
        if (window.celebInterval) clearInterval(window.celebInterval);
        window.celebInterval = setInterval(() => {
            const timeLeft = celebrateUntil - Date.now();
            if (timeLeft <= 0) {
                clearInterval(window.celebInterval);
                overlay.style.display = 'none';
            } else {
                const m = Math.floor(timeLeft / 60000);
                const s = Math.floor((timeLeft % 60000) / 1000);
                const timerSpan = document.getElementById('celeb-timer');
                if (timerSpan) timerSpan.textContent = `Hệ thống sẽ đếm lại từ đầu sau: 0${m}:${s < 10 ? '0' + s : s}`;
            }
        }, 1000);
    } else {
        if (window.celebInterval) clearInterval(window.celebInterval);
        if (overlay) overlay.style.display = 'none';
    }
});