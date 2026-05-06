        import { collection, getDocs, doc, getDoc, setDoc, query, limit, startAfter } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
        import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';
        window.showPopup = function(msg) {
            document.getElementById('popup-msg-text').textContent = msg;
            document.getElementById('custom-popup').style.display = 'flex';
        };

        window.closePopup = function() {
            document.getElementById('custom-popup').style.display = 'none';
        };

        let allBooks = [];
        let filteredBooks = [];
        let currentPage = 1;
        const itemsPerPage = 8;
        let isSortNewest = true;
        let showFavoritesOnly = false;
        let currentUser = null;
        let favoriteIds = [];

        const container = document.getElementById('library-list');
        const searchInput = document.getElementById('search-input');
        const sortBtn = document.getElementById('sort-btn');
        const sortText = document.getElementById('sort-text');
        const favFilterBtn = document.getElementById('filter-fav-btn');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        onAuthStateChanged(auth, async (user) => {
            favoriteIds = []; 
            if (user) {
                currentUser = user;
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists() && docSnap.data().favorites) {
                        favoriteIds = docSnap.data().favorites;
                    }
                } catch (error) {
                    console.error("Lỗi lấy dữ liệu tim:", error);
                }
            } else {
                currentUser = null;
                showFavoritesOnly = false;
                resetHeartUI();
            }
            renderPage();
        });

        function resetHeartUI() {
            const svgHeart = document.getElementById('big-heart-svg');
            favFilterBtn.classList.remove('active');
            svgHeart.setAttribute('fill', 'none');
            svgHeart.setAttribute('stroke', 'black');
        }
        async function fetchLibraryData() {
            try {
                const response = await fetch('Jsol/tac-pham.json');
                const jsonData = await response.json();
                allBooks = [...(jsonData.recommended || []), ...(jsonData.featured || []), ...(jsonData.featured_poems || [])];

                allBooks.forEach((book, index) => {
                    if (!book.google_id) book.google_id = `book_${index}`;
                    if (!book.year) book.year = 2024 - (index % 10);
                });
                applyFiltersAndRender();
                const loader = document.getElementById('page-loader');
                if (loader) loader.classList.add('hidden-loader');
                setTimeout(async () => {
                    try {
                        const snapshot = await getDocs(collection(db, "books"));
                        let needUpdate = false;

                        snapshot.forEach(docSnap => {
                            const dbBook = docSnap.data();
                            const localBook = allBooks.find(b => b.google_id === dbBook.google_id);

                            if (localBook) {
                                if ((localBook.completed_reads || 0) !== (dbBook.completed_reads || 0)) {
                                    localBook.completed_reads = dbBook.completed_reads || 0;
                                    needUpdate = true;
                                }
                            } else {
                                allBooks.push(dbBook);
                                needUpdate = true;
                            }
                        });
                        if (needUpdate) applyFiltersAndRender();
                    } catch (e) {
                        console.log("Lỗi đồng bộ ngầm:", e);
                    }
                }, 1000);

            } catch (error) {
                console.error("Lỗi tải thư viện:", error);
                container.innerHTML = '<h2 style="color:red; text-align:center;">Lỗi tải dữ liệu.</h2>';
                const loader = document.getElementById('page-loader');
                if (loader) loader.classList.add('hidden-loader');
            }
        }
        
        function applyFiltersAndRender() {
            let term = searchInput.value.toLowerCase().trim();
            filteredBooks = allBooks.filter(book => {
                let matchSearch = (book.title && book.title.toLowerCase().includes(term)) ||
                                  (book.author && book.author.toLowerCase().includes(term));
                
                if (!matchSearch && book.poems && Array.isArray(book.poems)) {
                    matchSearch = book.poems.some(poem => 
                        poem.title && poem.title.toLowerCase().includes(term)
                    );
                }

                const matchFav = showFavoritesOnly ? favoriteIds.includes(book.google_id) : true;
                return matchSearch && matchFav;
            });

            if (!isSortNewest) filteredBooks.reverse();
            currentPage = 1;
            renderPage();
        }

        function renderPage() {
            container.innerHTML = '';
            if (filteredBooks.length === 0) {
                container.innerHTML = '<h2 style="text-align: center; color: #16A34A; padding: 50px;">Không tìm thấy tác phẩm!</h2>';
                pageInfo.innerHTML = `<span style="color:#098B23">0</span> / 0 trang`;
                return;
            }

            let totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
            let start = (currentPage - 1) * itemsPerPage;
            let pageBooks = filteredBooks.slice(start, start + itemsPerPage);

            pageBooks.forEach(book => {
                const isFav = favoriteIds.includes(book.google_id);
                const title = book.title.length > 45 ? book.title.substring(0, 45) + "..." : book.title;
                const origin = book.origin || book.source || 'Việt Nam';
                const completedReads = book.completed_reads || 0; 
                const totalViews = completedReads * 13;

                container.insertAdjacentHTML('beforeend', `
                    <div class="lib-book-card">
                        <a href="chitiet.html?id=${book.google_id}" style="display: flex; gap: 30px; text-decoration: none; color: inherit; width: 100%;">
                            <img src="${book.cover_image || 'https://placehold.co/140x200?text=No+Cover'}" class="lib-book-cover" alt="Bìa sách">
                            
                            <div class="lib-book-info" style="width: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <h3 class="lib-book-title">${title}</h3>
                                    <div class="lib-book-meta">
                                        <span>Tác giả: <strong>${book.author || 'Đang cập nhật'}</strong></span>
                                        <span>Thể loại: <strong>${book.genre || 'Văn học'}</strong></span>
                                        <span>Xuất xứ: <strong>${origin}</strong></span>
                                    </div>
                                </div>
                                
                                <div style="text-align: right; color: #16A34A; font-weight: 700; font-size: 16px; margin-top: 15px;">
                                    Lượt đọc: ${totalViews.toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </a>
                        <svg class="heart-icon-card ${isFav ? 'active' : ''}" 
                             style="${!currentUser ? 'opacity: 0.3; cursor: not-allowed;' : ''}" 
                             data-id="${book.google_id}" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>`);
            });

            attachHeartEvents();

            pageInfo.innerHTML = `<span style="color:#098B23">${currentPage}</span> / ${totalPages} trang`;
            prevPageBtn.classList.toggle('disabled', currentPage === 1);
            nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
        }

        function attachHeartEvents() {
            document.querySelectorAll('.heart-icon-card').forEach(icon => {
                icon.onclick = async function () {
                    if (!currentUser) {
                        showPopup("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
                        const loginModal = document.getElementById('login-modal');
                        if (loginModal) loginModal.style.display = 'flex';
                        return;
                    }

                    const id = this.getAttribute('data-id');
                    
                    if (favoriteIds.includes(id)) {
                        favoriteIds = favoriteIds.filter(i => i !== id); 
                    } else {
                        favoriteIds.push(id); 
                    }
                    
                    this.classList.toggle('active');
                    if (showFavoritesOnly) applyFiltersAndRender();
                    
                    try {
                        const userRef = doc(db, "users", currentUser.uid);
                        await setDoc(userRef, { favorites: favoriteIds }, { merge: true });
                    } catch (error) {
                        console.error("Lỗi lưu:", error);
                        showPopup("Không thể lưu lên hệ thống. Vui lòng kiểm tra kết nối mạng!");
                    }
                };
            });
        }

        searchInput.oninput = applyFiltersAndRender;
        sortBtn.onclick = () => { 
            isSortNewest = !isSortNewest; 
            sortText.textContent = isSortNewest ? "Mới nhất" : "Cũ nhất"; 
            applyFiltersAndRender(); 
        };
        
        favFilterBtn.onclick = () => {
            if (!currentUser) {
                showPopup("Vui lòng đăng nhập để xem danh sách yêu thích!");
                return;
            }
            showFavoritesOnly = !showFavoritesOnly;
            favFilterBtn.classList.toggle('active');
            document.getElementById('big-heart-svg').setAttribute('fill', showFavoritesOnly ? '#ff4d4d' : 'none');
            document.getElementById('big-heart-svg').setAttribute('stroke', showFavoritesOnly ? '#ff4d4d' : 'black');
            applyFiltersAndRender();
        };

        prevPageBtn.onclick = () => { 
            if (currentPage > 1) { 
                currentPage--; 
                renderPage(); 
                document.getElementById('library-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } 
        };
        nextPageBtn.onclick = () => { 
            if (currentPage < Math.ceil(filteredBooks.length / itemsPerPage)) { 
                currentPage++; 
                renderPage(); 
                document.getElementById('library-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } 
        };

        fetchLibraryData();