// Header
class AppHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="header">
                <img src="Img/logoALTF4.png" alt="BloomRead Logo" class="ImgLogo">
                <h1 class="BloomRead">BLOOMREAD</h1>
                <nav class="nav-container">
                    <div class="nav-links">
                        <a href="index.html" class="nav-item">Trang Chủ</a>
                        <a href="lib.html" class="nav-item">Thư Viện</a>
                        <a href="garden.html" class="nav-item">Vườn Hoa</a>
                        <a href="shop.html" class="nav-item">Cửa Hàng</a>
                    </div>

                    <div class="action-buttons" id="auth-buttons">
                        <a href="#" class="login-btn" id="btn-show-login">Đăng Nhập</a>
                        <a href="#" class="login-btn" id="btn-show-register">Đăng Ký</a>
                    </div>

                    <div class="user-profile" id="user-profile" style="display: none;">
                        <div class="user-badge" id="user-name-display">Người Dùng</div>

                        <div class="user-menu-dropdown" id="user-menu">
                            <div class="menu-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <a href="#" class="menu-item">Đổi mật khẩu</a>
                            <a href="#" class="menu-item">Chính Sách Bảo Mật</a>
                            <a href="#" class="menu-item">Điều Khoản Dịch Vụ</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-item menu-logout" id="btn-logout-menu">Đăng xuất</a>
                        </div>
                    </div>
                </nav>
            </header>
        `;
    }
}
customElements.define('app-header', AppHeader);

//fopoter

class AppFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-left">
                        <div class="powered-by">POWERED BY</div>
                        <div class="logo-hover-container">
                            <img src="Img/logoALTF4.png" alt="ALT F4 Logo" class="logo-img-footer">
                            <div class="members-tooltip">
                                <div class="members-title">MEMBERS:</div>
                                <ul class="members-list">
                                    <li>Phạm Minh Quân</li>
                                    <li>Huỳnh Ngô Minh Quyền</li>
                                    <li>Trần Phước Thành</li>
                                    <li>Trần Gia Tú</li>
                                    <li>Ngô Nghĩa Phát</li>
                                    <li>Võ Duy Khôi</li>
                                    <li>Trần Tuấn Anh</li>
                                    <li>Lê Xuân Thảo</li>
                                    <li>Nguyễn Hoàng Nhật Anh</li>
                                    <li>Lê Hiếu Nghĩa</li>
                                    <li>Nguyễn Ngọc Uyên Nhi</li>
                                    <li>Lê Viết Chiến</li>
                                    <li>Châu Lê Trung Nguyên</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="footer-divider"></div>
                    <div class="footer-right">
                        <h2 class="contact-title">THÔNG TIN LIÊN HỆ</h2>
                        <ul class="contact-list">
                            <li class="contact-item">
                                <div class="contact-icon"><svg viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></svg></div>
                                <div class="contact-text">ĐỊA CHỈ: <span>36 Lê Lợi, Phường Bến Thành, TPHCM</span></div>
                            </li>
                            <li class="contact-item">
                                <div class="contact-icon"><svg viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" /></svg></div>
                                <div class="contact-text">ĐIỆN THOẠI: <span>0944817666</span></div>
                            </li>
                            <li class="contact-item">
                                <div class="contact-icon"><svg viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" /></svg></div>
                                <div class="contact-text" style="color: #22C55E;">EMAIL: ricute069@gmail.com</div>
                            </li>
                        </ul>
                        <div class="footer-bottom-info">
                            <div class="social-links">
                                <a href="#" class="social-icon social-fb"><svg viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg></a>
                                <a href="#" class="social-icon social-ig"><svg viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg></a>
                                <a href="#" class="social-icon social-yt"><svg viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" /></svg></a>
                                <a href="#" class="social-icon social-dc"><svg viewBox="0 0 640 512"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" /></svg></a>
                            </div>
                            <div class="online-status">
                                <svg viewBox="0 0 640 512">
                                    <path d="M144 160c-44.2 0-80-35.8-80-80S99.8 0 144 0s80 35.8 80 80s-35.8 80-80 80zm352 0c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80zM0 298.7C0 239.8 47.8 192 106.7 192h62.7c17.2 0 32.9 4.3 47.2 11.8c-10.9 21-17.6 44.5-17.6 69.5v30.7C199 337.1 226.9 363 260 380.5c-15.6 11.2-34.9 17.8-55.6 17.8H106.7C47.8 398.3 0 350.5 0 291.6V298.7zM435.6 398.3c-20.7 0-40-6.6-55.6-17.8c33.1-17.5 61-43.4 61-76.5V273.3c0-25 6.7-48.5 17.6-69.5c14.3-7.5 30-11.8 47.2-11.8h62.7C602.2 192 640 229.8 640 288.7v-7.1c0 58.9-47.8 106.7-106.7 106.7H435.6zM224 273.3v30.7c0 53 43 96 96 96s96-43 96-96V273.3c0-53-43-96-96-96s-96 43-96 96z" />
                                </svg>
                                <span class="online-count">Online: Đang tải...</span>
                            </div>
                        </div>
                        <div class="copyright">Copyright © 2026 ALT F4. All rights reserved</div>
                    </div>
                </div>
            </footer>
        `;
    }
}
customElements.define('app-footer', AppFooter);

// UI login

class AppAuthModals extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="login-modal" class="login-modal-overlay">
                <div class="login-modal-content">
                    <span class="close-login-btn">&times;</span>
                    <div class="user-icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <form class="login-form">
                        <input type="text" id="login-email" placeholder="Email" class="login-input" required>
                        <input type="password" id="login-password" placeholder="Mật khẩu" class="login-input" required>
                        <div class="login-options">
                            <label class="remember-me"><input type="checkbox"><span class="checkmark"></span>Ghi nhớ tôi</label>
                            <a href="#" class="forgot-password">Quên mật khẩu?</a>
                        </div>
                        <button type="submit" class="btn-submit-login">ĐĂNG NHẬP</button>
                        <button type="button" class="btn-google-login">
                            <svg viewBox="0 0 24 24" width="35" height="35" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg> GOOGLE
                        </button>
                    </form>
                    <div class="login-footer">
                        <a href="#">Điều khoản</a><a href="#" id="switch-to-register">Đăng ký</a>
                    </div>
                </div>
            </div>

            <div id="register-modal" class="login-modal-overlay">
                <div class="login-modal-content">
                    <div class="user-icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <form class="register-form">
                        <input type="text" id="reg-username" placeholder="Tên đăng nhập" class="login-input" required>
                        <input type="email" id="reg-email" placeholder="Email" class="login-input" required>
                        <input type="password" id="reg-password" placeholder="Mật khẩu" class="login-input" required>
                        <input type="password" id="reg-confirm-password" placeholder="Xác nhận mật khẩu" class="login-input" required>
                        <div class="login-options">
                            <label class="remember-me"><input type="checkbox" id="reg-terms" required><span class="checkmark"></span>Tôi đồng ý với <a href="#" style="color:#3B82F6"> Điều khoản</a></label>
                        </div>
                        <button type="submit" class="btn-submit-login">ĐĂNG KÝ</button>
                    </form>
                    <div class="login-footer" style="justify-content: flex-end;">
                        <a href="#" id="switch-to-login">Đăng nhập</a>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('app-auth-modals', AppAuthModals);