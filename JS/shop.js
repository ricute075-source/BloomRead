import { doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

let currentUser = null;
let userData = {};

const COIN_ICON = "Img/ReadPoint.png";
const MAX_WATER = 16;

const shopData = {
    seeds: [
        { id: 's1', name: 'Hạt giống hoa hướng dương', price: 5, img: 'Img/SunFlower/Seed.png' },
    ],
    pots: [
        { id: 'w1', name: 'Chai Nước', price: 5, img: 'Img/nuoc.png' },
        { id: 'p1', name: 'Chậu Thường', price: 50, img: 'Img/NormalPot.png' },
        { id: 'p2', name: 'Chậu Vàng', price: 500, img: 'Img/GoldenPot.png' },
        { id: 'p3', name: 'Chậu Của Coder', price: 0, img: 'Img/CoderPot.png' }
    ],
    bgs: [
        { id: 'b1', name: 'Khu vườn ban mai', price: 200, img: 'Img/KhuVuonBanMai.jpg' },
        { id: 'b2', name: 'Rừng đêm huyền bí', price: 500, img: 'Img/Rung_Dem_Huyen_Bi.png' },
        { id: 'b3', name: 'Sói của Minh Quyền', price: 500, img: 'Img/SoiCuaMinhQuyen.png' },
        { id: 'b4', name: 'Sự Phẫn Nộ Của Quân', price: 400, img: 'Img/Dr.Minh_Quan_Gian_Giu.jpg' } // Nền Ẩn MQGD
    ],
    events: [
        { id: 'c1', name: 'Dr.Minh Quân', price: 0, img: 'Img/DrMinhQuan.png' },
        { id: 'c2', name: 'Quyền Cô Độc', price: 0, img: 'Img/MinhQuyen.png' }
    ]
};

window.showPopup = function(msg) {
    document.getElementById('popup-msg-text').textContent = msg;
    document.getElementById('custom-popup').style.display = 'flex';
};

window.closePopup = function() {
    document.getElementById('custom-popup').style.display = 'none';
};

window.showConfirm = function(msg) {
    return new Promise((resolve) => {
        document.getElementById('confirm-msg-text').textContent = msg;
        document.getElementById('custom-confirm').style.display = 'flex';

        document.getElementById('btn-confirm-yes').onclick = () => {
            document.getElementById('custom-confirm').style.display = 'none';
            resolve(true);
        };
        document.getElementById('btn-confirm-no').onclick = () => {
            document.getElementById('custom-confirm').style.display = 'none';
            resolve(false);
        };
    });
};

function renderShopItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<h3 style="color: #666; width: 100%; text-align: center; margin-top: 50px; grid-column: 1 / -1;">Vật phẩm đang được cập nhật...</h3>';
        return;
    }

    container.innerHTML = items.map(item => {
        const inventory = userData.inventory || {};
        const ownedCount = inventory[item.id] || 0;
        let btnHtml = '';
        let displayName = item.name;
        let displayPrice = item.price;

        // Xử lý điều kiện ẩn cho Nền Sói của Minh Quyền
        if (item.id === 'b3' && !inventory['c2']) {
            displayName = "???";
            displayPrice = "???";
            btnHtml = `<button class="btn-buy" disabled>CẦN CHỦ NHÂN</button>`;
        } 
        // Xử lý điều kiện ẩn cho Nền Dr Minh Quân Giận Dữ (MQGD)
        else if (item.id === 'b4' && !userData.MQGD) {
            displayName = "???";
            displayPrice = "???";
            btnHtml = `<button class="btn-buy btn-unequip" onclick="showPopup('Hãy khiến ông ta tức giận')">ĐIỀU KIỆN</button>`;
        }
        else if (item.id === 'w1') {
            if (ownedCount >= MAX_WATER) {
                btnHtml = `<button class="btn-buy" disabled>TỐI ĐA (${MAX_WATER}/${MAX_WATER})</button>`;
            } else {
                btnHtml = `<button class="btn-buy" onclick="buyItem('${item.id}', '${item.name}', ${item.price}, '${containerId}')">MUA (${ownedCount}/${MAX_WATER})</button>`;
            }
        } 
        // Xử lý Hạt giống (mua nhiều lần, tối đa 2)
        else if (containerId === 'tab-seeds') {
            if (ownedCount >= 2) {
                btnHtml = `<button class="btn-buy" disabled>TỐI ĐA (2/2)</button>`;
            } else {
                btnHtml = `<button class="btn-buy" onclick="buyItem('${item.id}', '${item.name}', ${item.price}, '${containerId}')">MUA (${ownedCount}/2)</button>`;
            }
        } 
        // Xử lý các vật phẩm mua 1 lần (Chậu, Nền, Nhân vật)
        else {
            if (ownedCount === true || ownedCount >= 1) {
                btnHtml = `<button class="btn-buy" disabled>ĐÃ SỞ HỮU</button>`;
            } else {
                const btnText = item.price === 0 ? "NHẬN MIỄN PHÍ" : "MUA";
                btnHtml = `<button class="btn-buy" onclick="buyItem('${item.id}', '${item.name}', ${item.price}, '${containerId}')">${btnText}</button>`;
            }
        }

        return `
        <div class="item-card">
            <img src="${item.img}" class="item-img" alt="${displayName}">
            <div class="item-name">${displayName}</div>
            <div class="item-price">
                <img src="${COIN_ICON}" alt="Coin">
                <span>${displayPrice}</span>
            </div>
            ${btnHtml}
        </div>
    `;
    }).join('');
}

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
};

window.buyItem = async (id, name, price, category) => {
    if (!currentUser) return showPopup("Vui lòng đăng nhập để mua hàng!");

    if (!userData.inventory) userData.inventory = {};
    const currentOwned = userData.inventory[id] || 0;
    
    // Bảo mật điều kiện mua
    if (id === 'b3' && !userData.inventory['c2']) {
        return showPopup("Bạn cần nhận Designer Minh Quyền trước khi mua nền này!");
    }
    if (id === 'b4' && !userData.MQGD) {
        return showPopup("Hãy khiến ông ta tức giận!");
    }

    if (id === 'w1' && currentOwned >= MAX_WATER) return showPopup(`Bạn đã đạt giới hạn ${MAX_WATER} chai nước trong balo!`);
    if (category === 'tab-seeds' && currentOwned >= 2) return showPopup("Bạn đã đạt giới hạn 2 hạt cho loại này!");
    if (category !== 'tab-seeds' && id !== 'w1' && (currentOwned === true || currentOwned >= 1)) return showPopup("Bạn đã sở hữu vật phẩm này rồi!");

    if (userData.readpoints < price) {
        showPopup(`Thất bại!\nBạn cần thêm ${price - userData.readpoints} ReadPoints nữa để mua vật phẩm này! Hãy đọc sách thêm nhé.`);
        return;
    }

    let confirmMsg = `Bạn có chắc muốn mua [${name}] với giá ${price} ReadPoints?`;
    if (price === 0) confirmMsg = `Bạn có muốn nhận miễn phí [${name}] không?`;

    const confirmBuy = await showConfirm(confirmMsg);
    if (!confirmBuy) return;

    userData.readpoints -= price;
    if (category === 'tab-seeds') {
        userData.seeds = (userData.seeds || 0) + 1;
        userData.inventory[id] = currentOwned + 1;
    } else if (id === 'w1') {
        userData.inventory[id] = currentOwned + 1;
    } else {
        userData.inventory[id] = true;
    }

    document.getElementById('display-readpoints').textContent = userData.readpoints;
    const currentTabItems = category === 'tab-seeds' ? shopData.seeds : 
                           (category === 'tab-pots' ? shopData.pots : 
                           (category === 'tab-bgs' ? shopData.bgs : shopData.events));
    
    if (id === 'c2') {
        renderShopItems('tab-bgs', shopData.bgs); // Cập nhật lại tab hình nền nếu vừa nhận Minh Quyền
    }
    renderShopItems(category, currentTabItems);

    // Popup thông báo
    if (category === 'tab-seeds' || id === 'w1') {
        showPopup(`Giao dịch thành công!\nBạn đã mua thêm 1 ${name}.`);
    } else {
        if (id === 'p3') {
            showPopup(`Từ Coder\nTrân trọng cảm ơn bạn đã đồng hành cùng dự án BloomRead!\n\nChiếc chậu độc quyền này là món quà nhỏ thay lời tri ân. Chúc bạn có những giờ phút đọc sách thật vui!`);
        } else if (id === 'c1') {
            showPopup(`Từ Tiến sĩ Minh Quân\n"Ta, Tiến sĩ Minh Quân, xin gửi lời ghi nhận đến tất cả các ngươi vì đã ủng hộ dự án BloomRead. Dù trí tuệ của các ngươi có lẽ sẽ không bao giờ sánh kịp ta, nhưng sự nỗ lực học hỏi này rất đáng khen ngợi. Nhớ chăm chỉ đọc sách và đừng làm héo những cái cây đó, ta sẽ luôn giám sát các ngươi!"`);
        } else if (id === 'c2') {
            showPopup(`Từ Designer Minh Quyền\n"Cảm ơn bạn đã luôn ủng hộ BloomRead! Hy vọng những thiết kế của mình sẽ mang lại cho bạn một không gian đọc sách thật thư giãn và đầy cảm hứng. Hãy ghé qua cửa hàng Nền, mình có một bé sói đang đợi bạn đón về đấy!"`);
        } else {
            showPopup(`Đã lưu [${name}] vào Kho Đồ của bạn!`);
        }
    } 

    // Cập nhật lên Firebase
    let updateData = { readpoints: increment(-price) };
    if (category === 'tab-seeds') {
        updateData.seeds = increment(1); 
        updateData[`inventory.${id}`] = increment(1);
    } else if (id === 'w1') {
        updateData[`inventory.${id}`] = increment(1);
    } else {
        updateData[`inventory.${id}`] = true;
    }

    const userRef = doc(db, "users", currentUser.uid);
    updateDoc(userRef, updateData).catch(error => {
        console.error("Lỗi đồng bộ ngầm với Firebase:", error);
    });
};

onAuthStateChanged(auth, async (user) => {
    const shopWrapper = document.getElementById('shop-wrapper');

    if (user) {
        currentUser = user;
        if (shopWrapper) shopWrapper.style.display = 'block'; 
        await fetchUserData();
    } else {
        currentUser = null;
        if (shopWrapper) shopWrapper.style.display = 'none'; 
        document.getElementById('page-loader').classList.add('hidden-loader');
        
        const checkModalInterval = setInterval(() => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                clearInterval(checkModalInterval);
                loginModal.style.display = 'flex';
                
                const closeBtn = document.querySelector('.close-login-btn');
                if (closeBtn) {
                    closeBtn.onclick = () => { if (!currentUser) window.location.href = 'index.html'; };
                }
                window.onclick = (e) => {
                    if (e.target === loginModal && !currentUser) window.location.href = 'index.html';
                };
            }
        }, 100); 
    }
});

async function fetchUserData() {
    const userRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
        userData = docSnap.data();
        if (!userData.inventory) userData.inventory = {};
    } else {
        userData = { flowers: 0, seeds: 1, hasReceivedFreeSeed: true, readpoints: 0, inventory: {} };
        await setDoc(userRef, userData);
    }
    
    userData.readpoints = userData.readpoints || 0;
    document.getElementById('display-readpoints').textContent = userData.readpoints;

    renderShopItems('tab-seeds', shopData.seeds);
    renderShopItems('tab-pots', shopData.pots);
    renderShopItems('tab-bgs', shopData.bgs);
    renderShopItems('tab-event', shopData.events);

    document.getElementById('page-loader').classList.add('hidden-loader');
}