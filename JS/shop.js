       import { doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
        import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';
        let currentUser = null;
        let userData = {};

        const COIN_ICON = "Img/MinhQuanSeed.jpg";
        
        const shopData = {
            seeds: [
                { id: 's1', name: 'Hạt giống hoa hướng dương', price: 5, img: 'Img/SunFlower/Seed.png' },
            ],
            pots: [
                { id: 'p1', name: 'Chậu Thường', price: 50, img: 'Img/NormalPot.png' },
                { id: 'p2', name: 'Chậu Vàng', price: 500, img: 'Img/GoldenPot.png' },
                { id: 'p3', name: 'Chậu Của Coder', price: 0, img: 'Img/CoderPot.png' }
            ],
            bgs: [
                { id: 'b1', name: 'Khu vườn ban mai', price: 200, img: 'Img/MinhQuanSeed.jpg' },
                { id: 'b2', name: 'Rừng đêm huyền bí', price: 500, img: 'Img/MinhQuanSeed.jpg' }
            ],
            events: [
                { id: 'e1', name: 'Hộp quà bí ẩn Tết', price: 999, img: 'Img/MinhQuanSeed.jpg' }
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

                if (containerId === 'tab-seeds') {
                    if (ownedCount >= 2) {
                        btnHtml = `<button class="btn-buy" disabled>TỐI ĐA (2/2)</button>`;
                    } else {
                        btnHtml = `<button class="btn-buy" onclick="buyItem('${item.id}', '${item.name}', ${item.price}, '${containerId}')">MUA (${ownedCount}/2)</button>`;
                    }
                } else {
                    if (ownedCount === true || ownedCount >= 1) {
                        btnHtml = `<button class="btn-buy" disabled>ĐÃ SỞ HỮU</button>`;
                    } else {
                        const btnText = item.price === 0 ? "NHẬN MIỄN PHÍ" : "MUA";
                        btnHtml = `<button class="btn-buy" onclick="buyItem('${item.id}', '${item.name}', ${item.price}, '${containerId}')">${btnText}</button>`;
                    }
                }

                return `
                <div class="item-card">
                    <img src="${item.img}" class="item-img" alt="${item.name}">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">
                        <img src="${COIN_ICON}" alt="Coin">
                        <span>${item.price}</span>
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
            
            if (category === 'tab-seeds' && currentOwned >= 2) return showPopup("Bạn đã đạt giới hạn 2 hạt cho loại này!");
            if (category !== 'tab-seeds' && (currentOwned === true || currentOwned >= 1)) return showPopup("Bạn đã sở hữu vật phẩm này rồi!");

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
            } else {
                userData.inventory[id] = true;
            }

            document.getElementById('display-readpoints').textContent = userData.readpoints;
            const currentTabItems = category === 'tab-seeds' ? shopData.seeds : 
                                   (category === 'tab-pots' ? shopData.pots : 
                                   (category === 'tab-bgs' ? shopData.bgs : shopData.events));
            renderShopItems(category, currentTabItems);

            if (category === 'tab-seeds') {
                showPopup(`Giao dịch thành công!\nBạn đã mua ${name}.`);
            } else {
                if (id === 'p3') {
                    showPopup(`Từ Coder\nTrân trọng cảm ơn bạn đã đồng hành cùng dự án BloomRead!\n\nChiếc chậu độc quyền này là món quà nhỏ thay lời tri ân. Chúc bạn có những giờ phút đọc sách thật vui!`);
                } else {
                    showPopup(`Đã lưu [${name}] vào Kho Đồ của bạn!`);
                }
            } 

            let updateData = { readpoints: increment(-price) };
            if (category === 'tab-seeds') {
                updateData.seeds = increment(1); 
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