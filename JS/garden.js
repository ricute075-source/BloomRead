import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

// 1. TẠO STYLE KHÓA HOVER CHẬU KHI ĐÃ TRỒNG CÂY
const style = document.createElement('style');
style.innerHTML = `
    .pot-wrapper.is-planted:hover .center-pot {
        transform: none !important;
        filter: drop-shadow(0 20px 20px rgba(0,0,0,0.5)) !important;
    }
`;
document.head.appendChild(style);

// 2. TẠO POPUP CONFIRM ĐỘNG CHO VƯỜN HOA
window.showConfirm = function(msg) {
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

const PLANT_STAGES = [
    { threshold: 0,   img: 'Img/SunFlower/BrokenPot_Seed0.png', label: "CÂY MẦM" },
    { threshold: 10,  img: 'Img/SunFlower/BrokenPot_Seed1.png', label: "CÂY NON" },
    { threshold: 30,  img: 'Img/SunFlower/BrokenPot_Seed2.png', label: "TRƯỞNG THÀNH" },
    { threshold: 50,  img: 'Img/SunFlower/BrokenPot_Seed3.png', label: "NỤ HOA" },
    { threshold: 70,  img: 'Img/SunFlower/BrokenPot_Seed4.png', label: "NỞ HOA" }
];

const ITEM_DB = {
    's1': { name: 'Hoa hướng dương', img: 'Img/SunFlower/Seed.png', type: 'seed' },
    'p1': { name: 'Chậu Thường', img: 'Img/NormalPot.png', type: 'pot' },
    'p2': { name: 'Chậu Vàng', img: 'Img/GoldenPot.png', type: 'pot' },
    'p3': { name: 'Chậu Của Coder', img: 'Img/CoderPot.png', type: 'pot' },
    'b1': { name: 'Khu vườn ban mai', img: 'Img/MinhQuanSeed.jpg', type: 'bg' },
    'b2': { name: 'Rừng đêm huyền bí', img: 'Img/MinhQuanSeed.jpg', type: 'bg' }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const cheatBtn = document.getElementById('cheat-btn');
        if (user.email === "ricute069@gmail.com") {
            cheatBtn.style.display = 'block';
            cheatBtn.onclick = handleCheatGrowth; 
        }
        await fetchAndCheckUser();
    } else {
        currentUser = null;
        document.getElementById('page-loader').classList.add('hidden-loader');
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
        if(!userData.inventory) userData.inventory = {};
        if(userData.plantProgress === undefined) userData.plantProgress = 0; 
    } else {
        userData = { flowers: 0, seeds: 1, inventory: {}, plantProgress: 0 };
        await setDoc(userRef, userData);
    }

    updateGardenVisuals();
    renderInventoryUI();
    document.getElementById('page-loader').classList.add('hidden-loader');
}

function updateGardenVisuals() {
    const mainBg = document.getElementById('main-bg');
    const centerPot = document.getElementById('center-pot');
    const seedHint = document.getElementById('seed-hint');
    const plantedSeedImg = document.getElementById('planted-seed');
    const potWrapper = document.getElementById('pot-wrapper');
    
    mainBg.style.backgroundImage = `url('${userData.equippedBg || 'Img/AnhBackGroundGarden.png'}')`;

    let currentPotImg = userData.equippedPot || 'Img/BrokenPot.png';
    let currentPlantStageImg = currentPotImg; 
    let currentLabel = "CHỌN HẠT GIỐNG";
    if (userData.plantedSeed) {
        potWrapper.classList.add('is-planted');
    } else {
        potWrapper.classList.remove('is-planted');
    }

    if (userData.plantedSeed && currentPotImg === 'Img/BrokenPot.png') {
        const progress = userData.plantProgress || 0;
        
        let currentStage = PLANT_STAGES[0];
        for (let i = 0; i < PLANT_STAGES.length; i++) {
            if (progress >= PLANT_STAGES[i].threshold) {
                currentStage = PLANT_STAGES[i];
            } else {
                break; 
            }
        }
        
        currentPlantStageImg = currentStage.img;
        currentLabel = progress >= 100 ? "THU HOẠCH NGAY!" : currentStage.label;
        
        if(plantedSeedImg) plantedSeedImg.classList.remove('show');
    } 
    else if (userData.plantedSeed && currentPotImg !== 'Img/BrokenPot.png') {

        currentLabel = userData.plantProgress >= 100 ? "THU HOẠCH NGAY!" : "CHĂM SÓC CÂY";
        if(plantedSeedImg) {
            plantedSeedImg.src = userData.plantedSeed;
            plantedSeedImg.classList.add('show');
        }
    } 
    else {
        if(plantedSeedImg) plantedSeedImg.classList.remove('show');
    }

    centerPot.src = currentPlantStageImg;
    seedHint.textContent = currentLabel;
}

async function handleCheatGrowth() {
    if (!userData.plantedSeed) {
        if(window.showPopup) window.showPopup("Bạn phải gieo hạt trước khi dùng quyền Gia Trưởng ép cây lớn chứ!");
        return;
    }
    
    userData.plantProgress = Math.min((userData.plantProgress || 0) + 20, 100);
    
    try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { plantProgress: userData.plantProgress });
        updateGardenVisuals();
    } catch (e) {
        console.error("Lỗi buff cây:", e);
    }
}

const bagIcon = document.getElementById('bag-icon');
const invWrapper = document.getElementById('inventory-wrapper');
const closeInvBtn = document.getElementById('close-inv-btn');
const potWrapper = document.getElementById('pot-wrapper');

bagIcon.onclick = () => {
    if(!currentUser) {
        if(window.showPopup) window.showPopup("Bạn cần đăng nhập để xem túi đồ!");
        return;
    }
    const isOpen = invWrapper.classList.toggle('show');
    bagIcon.src = isOpen ? 'Img/bag_opened.png' : 'Img/bag_closed.png';
    if(isOpen) renderInventoryUI();
};

closeInvBtn.onclick = () => {
    invWrapper.classList.remove('show');
    bagIcon.src = 'Img/bag_closed.png';
};

potWrapper.onclick = async () => {
    if(!currentUser) {
        if(window.showPopup) window.showPopup("Bạn cần đăng nhập để tương tác!");
        return;
    }
    
    if (!userData.plantedSeed) {
        invWrapper.classList.add('show');
        bagIcon.src = 'Img/bag_opened.png';
        window.switchInvTab('inv-seeds', document.querySelector('.inv-tab'));
        renderInventoryUI();
    } else {
        if (userData.plantProgress >= 100) {
            const isConfirm = await window.showConfirm("Hoa đã nở rộ! Bạn có muốn thu hoạch không?");
            if (isConfirm) {
                try {
                    const serverRef = doc(db, "server", "stats");
                    await setDoc(serverRef, {
                        totalFlowers: increment(1),
                        realFlowers: increment(1)
                    }, { merge: true });

                    userData.plantedSeed = null;
                    userData.plantProgress = 0;
                    
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, { 
                        plantedSeed: null, 
                        plantProgress: 0 
                    });

                    updateGardenVisuals();
                    renderInventoryUI();
                    if(window.showPopup) window.showPopup("Thu hoạch thành công! Cám ơn bạn đã đóng góp 1 đóa hoa cho cộng đồng.");
                } catch (error) {
                    console.error("Lỗi thu hoạch:", error);
                    if(window.showPopup) window.showPopup("Có lỗi xảy ra khi thu hoạch. Vui lòng kiểm tra lại mạng!");
                }
            }
        } else {
            if(window.showPopup) window.showPopup("Cây đang trong quá trình phát triển, hãy kiên nhẫn chờ đợi và chăm sóc nhé!");
        }
    }
};

window.switchInvTab = (tabId, btnElement) => {
    document.querySelectorAll('.inv-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.inv-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
};

function renderInventoryUI() {
    const seedContainer = document.getElementById('inv-seeds');
    const potContainer = document.getElementById('inv-pots');
    const bgContainer = document.getElementById('inv-bgs');
    
    let htmlSeeds = '', htmlPots = '', htmlBgs = '';
    
    if(userData.seeds > 0 && !userData.inventory['s1']) userData.inventory['s1'] = userData.seeds;

    for (const [id, count] of Object.entries(userData.inventory)) {
        if (!ITEM_DB[id] || !count) continue;
        const item = ITEM_DB[id];
        
        let isEquipped = (item.type === 'pot' && userData.equippedPot === item.img) || 
                         (item.type === 'bg' && userData.equippedBg === item.img);
        
        let btnAction = isEquipped ? 'unequip' : item.img;
        
        let btnText = "";
        let btnClass = isEquipped ? 'btn-use btn-unequip' : 'btn-use';
        let isDisabled = false;

        if (item.type === 'seed') {
            if (userData.plantedSeed) {
                btnText = "ĐANG TRỒNG";
                isDisabled = true;
                btnClass = 'btn-use btn-unequip'; 
            } else {
                btnText = "GIEO HẠT";
            }
        } else {
            btnText = isEquipped ? 'GỠ BỎ' : 'DÙNG';
        }

        const cardHtml = `
            <div class="inv-item-card">
                <img src="${item.img}" class="inv-item-img" alt="${item.name}">
                <div class="inv-item-name">${item.name}</div>
                ${item.type === 'seed' ? `<div class="inv-item-qty">Số lượng: ${count}</div>` : ''}
                <button class="${btnClass}" ${isDisabled ? 'disabled' : ''} onclick="useItem('${id}', '${item.type}', '${btnAction}')">
                    ${btnText}
                </button>
            </div>
        `;

        if (item.type === 'seed') htmlSeeds += cardHtml;
        else if (item.type === 'pot') htmlPots += cardHtml;
        else if (item.type === 'bg') htmlBgs += cardHtml;
    }

    seedContainer.innerHTML = htmlSeeds || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Túi đồ trống. Hãy ghé Cửa Hàng nhé!</p>';
    potContainer.innerHTML = htmlPots || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Chưa có chậu hoa nào.</p>';
    bgContainer.innerHTML = htmlBgs || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Chưa có hình nền nào.</p>';
}

window.useItem = async (id, type, actionPath) => {
    if(!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);

    if (type === 'seed') {
        const seedItem = ITEM_DB[id];
        
        invWrapper.classList.remove('show');
        bagIcon.src = 'Img/bag_closed.png';

        if(window.showPopup) window.showPopup(`Bạn vừa gieo [${seedItem.name}] thành công!`);

        userData.plantedSeed = seedItem.img;
        userData.seeds -= 1;
        userData.inventory[id] -= 1;
        
        userData.plantProgress = 0; 

        if (userData.inventory[id] <= 0) delete userData.inventory[id];

        try {
            await updateDoc(userRef, { 
                plantedSeed: seedItem.img,
                seeds: userData.seeds,
                inventory: userData.inventory,
                plantProgress: userData.plantProgress 
            });
        } catch (error) {
            console.error("Lỗi gieo hạt Firebase:", error);
        }

        updateGardenVisuals(); 
        renderInventoryUI();
    } 
    else if (type === 'pot') {
        const newPot = actionPath === 'unequip' ? 'Img/BrokenPot.png' : actionPath;
        await updateDoc(userRef, { equippedPot: newPot === 'Img/BrokenPot.png' ? null : newPot });
        userData.equippedPot = newPot === 'Img/BrokenPot.png' ? null : newPot;
        
        updateGardenVisuals(); 
        renderInventoryUI(); 
    } 
    else if (type === 'bg') {
        const newBg = actionPath === 'unequip' ? 'Img/AnhBackGroundGarden.png' : actionPath;
        await updateDoc(userRef, { equippedBg: newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg });
        userData.equippedBg = newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg;
        
        updateGardenVisuals();
        renderInventoryUI(); 
    }
};

onSnapshot(doc(db, "server", "stats"), (docSnap) => {
    let celebrateUntil = 0, realFlowers = 0;
    if (docSnap.exists()) {
        celebrateUntil = docSnap.data().celebrateUntil || 0;
        realFlowers = docSnap.data().realFlowers || 0;
    }

    const now = Date.now();

    if (!document.getElementById('celebration-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'celebration-overlay';
        overlay.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(22, 163, 74, 0.96); z-index: 100000; justify-content: center; align-items: center; flex-direction: column; color: white; text-align: center; backdrop-filter: blur(8px); animation: fadeIn 0.5s ease;";
        overlay.innerHTML = `
            <h1 style="font-size: 55px; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); padding: 0 20px;">CHIẾN DỊCH THÀNH CÔNG!</h1>
            <p style="font-size: 26px; max-width: 900px; line-height: 1.5; padding: 0 20px;">Cộng đồng BloomRead vừa gom đủ 300 đóa hoa ảo. Một phần quà thiện nguyện thực tế mang tên dự án chuẩn bị được gửi đi!</p>
            <p style="font-size: 28px; margin-top: 40px; color: #FDE047;">Tổng số hoa thực tế đã quyên góp: <span id="real-flowers-count" style="font-size: 36px; text-decoration: underline;">0</span> bông</p>
            <p style="font-size: 18px; margin-top: 40px; opacity: 0.9; background: rgba(0,0,0,0.2); padding: 10px 20px; border-radius: 50px;" id="celeb-timer">Hệ thống sẽ đếm lại từ đầu sau: 05:00</p>
        `;
        document.body.appendChild(overlay);
    }

    if (celebrateUntil > now) {
        document.getElementById('celebration-overlay').style.display = 'flex';
        document.getElementById('real-flowers-count').textContent = realFlowers;

        if (window.celebInterval) clearInterval(window.celebInterval);
        window.celebInterval = setInterval(() => {
            const timeLeft = celebrateUntil - Date.now();
            if (timeLeft <= 0) {
                clearInterval(window.celebInterval);
                document.getElementById('celebration-overlay').style.display = 'none';
            } else {
                const m = Math.floor(timeLeft / 60000);
                const s = Math.floor((timeLeft % 60000) / 1000);
                document.getElementById('celeb-timer').textContent = `Hệ thống sẽ đếm lại từ đầu sau: 0${m}:${s < 10 ? '0'+s : s}`;
            }
        }, 1000);
    } else {
        if (window.celebInterval) clearInterval(window.celebInterval);
        const overlay = document.getElementById('celebration-overlay');
        if (overlay) overlay.style.display = 'none';
    }
});