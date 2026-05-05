import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDEyyfIjheNTY3O7klH7tkpGKXEXm2ku4I",
    authDomain: "dangnhap-5069e.firebaseapp.com",
    projectId: "dangnhap-5069e",
    storageBucket: "dangnhap-5069e.firebasestorage.app",
    messagingSenderId: "596384133171",
    appId: "1:596384133171:web:4ab1b9b3bb37d0720c3346",
    measurementId: "G-HDMQ6PJ1BN"
};

let app;
let db;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        // KÍCH HOẠT CACHE CỤC BỘ: Giúp web load tức thì ở các lần sau
        localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
    });
} else {
    app = getApps()[0];
    db = getFirestore(app);
}

export { app, db };
export const auth = getAuth(app);