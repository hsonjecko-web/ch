
/* ========================================
   التطبيق المشترك - Common JavaScript
   ======================================== */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVP5IRHetBo7JDSRLteQOFX4fhsts3ur0",
    authDomain: "chat-94032.firebaseapp.com",
    projectId: "chat-94032",
    storageBucket: "chat-94032.firebasestorage.app",
    messagingSenderId: "920803161623",
    appId: "1:920803161623:web:a2995a99c07b42af1d0e52"
};

// Global Variables
let currentUser = null;
let currentUserData = null;

// Country Data
const countries = [
    { code: 'SA', name: 'المملكة العربية السعودية', dial: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'الإمارات العربية المتحدة', dial: '+971', flag: '🇦🇪' },
    { code: 'KW', name: 'دولة الكويت', dial: '+965', flag: '🇰🇼' },
    { code: 'QA', name: 'دولة قطر', dial: '+974', flag: '🇶🇦' },
    { code: 'BH', name: 'مملكة البحرين', dial: '+973', flag: '🇧🇭' },
    { code: 'OM', name: 'سلطنة عمان', dial: '+968', flag: '🇴🇲' },
    { code: 'EG', name: 'جمهورية مصر العربية', dial: '+20', flag: '🇪🇬' },
    { code: 'JO', name: 'المملكة الأردنية الهاشمية', dial: '+962', flag: '🇯🇴' },
    { code: 'LB', name: 'الجمهورية اللبنانية', dial: '+961', flag: '🇱🇧' },
    { code: 'IQ', name: 'جمهورية العراق', dial: '+964', flag: '🇮🇶' },
    { code: 'SY', name: 'الجمهورية العربية السورية', dial: '+963', flag: '🇸🇾' },
    { code: 'PS', name: 'دولة فلسطين', dial: '+970', flag: '🇵🇸' },
    { code: 'SD', name: 'جمهورية السودان', dial: '+249', flag: '🇸🇩' },
    { code: 'LY', name: 'دولة ليبيا', dial: '+218', flag: '🇱🇾' },
    { code: 'TN', name: 'الجمهورية التونسية', dial: '+216', flag: '🇹🇳' },
    { code: 'DZ', name: 'الجمهورية الجزائرية', dial: '+213', flag: '🇩🇿' },
    { code: 'MA', name: 'المملكة المغربية', dial: '+212', flag: '🇲🇦' },
    { code: 'YE', name: 'الجمهورية اليمنية', dial: '+967', flag: '🇾🇪' },
    { code: 'US', name: 'الولايات المتحدة الأمريكية', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'المملكة المتحدة', dial: '+44', flag: '🇬🇧' }
];

let selectedCountry = countries[0];

/* ========================================
   Firebase Initialization
   ======================================== */
async function initFirebase() {
    if (!window.firebaseApps || window.firebaseApps.length === 0) {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const app = initializeApp(firebaseConfig);
        window.firebaseApps = [app];
    }
    
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    
    window.firebaseDb = getFirestore(window.firebaseApps[0]);
    window.firebaseAuth = getAuth(window.firebaseApps[0]);
    
    return { db: window.firebaseDb, auth: window.firebaseAuth };
}

/* ========================================
   Theme Management
   ======================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcons = document.querySelectorAll('#themeIcon, #themeToggle');
    themeIcons.forEach(icon => {
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
}

// Make functions available globally
window.toggleTheme = toggleTheme;

/* ========================================
   Toast Notifications
   ======================================== */
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<span>✓</span><span id="toastMessage"></span>';
        document.body.appendChild(toast);
    }
    
    const toastMessage = document.getElementById('toastMessage');
    toast.className = 'toast ' + type;
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.showToast = showToast;

/* ========================================
   Loading State Functions
   ======================================== */
function setLoading(btnId, spinnerId, isLoading) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    
    if (btn) btn.disabled = isLoading;
    if (spinner) {
        if (isLoading) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }
}

window.setLoading = setLoading;

/* ========================================
   Tab Switching
   ======================================== */
function switchTab(tabName, tabElement) {
    // Update tab buttons
    const tabs = tabElement.parentElement.querySelectorAll('.tab, .stat-card');
    tabs.forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
    
    // Update tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active'));
    
    const targetContent = document.getElementById('tab-' + tabName);
    if (targetContent) targetContent.classList.add('active');
}

window.switchTab = switchTab;

/* ========================================
   Country Selection Functions
   ======================================== */
function renderCountries() {
    const container = document.getElementById('countriesContainer');
    if (!container) return;
    
    let html = '';
    countries.forEach(country => {
        const selectedClass = selectedCountry.code === country.code ? 'style="background: rgba(30, 58, 95, 0.1);"' : '';
        html += `<div class="country-item" onclick="selectCountry('${country.code}')" ${selectedClass}>
            <span>${country.flag}</span>
            <span style="flex: 1;">${country.name}</span>
            <span style="color: var(--text-muted); font-size: 13px;">${country.dial}</span>
        </div>`;
    });
    container.innerHTML = html;
}

window.toggleCountryList = function() {
    const dropdown = document.getElementById('countryDropdown');
    const trigger = document.querySelector('.country-trigger');
    if (dropdown) dropdown.classList.toggle('show');
    if (trigger) trigger.classList.toggle('active');
};

window.selectCountry = function(code) {
    selectedCountry = countries.find(c => c.code === code);
    
    const flagEl = document.getElementById('selectedFlag');
    const countryEl = document.getElementById('selectedCountry');
    const codeEl = document.getElementById('selectedCode');
    const phoneCodeEl = document.getElementById('phoneCode');
    
    if (flagEl) flagEl.textContent = selectedCountry.flag;
    if (countryEl) countryEl.textContent = selectedCountry.name;
    if (codeEl) codeEl.textContent = selectedCountry.dial;
    if (phoneCodeEl) phoneCodeEl.textContent = selectedCountry.dial;
    
    window.toggleCountryList();
};

window.filterCountries = function() {
    const search = document.getElementById('countrySearch').value.toLowerCase();
    const filtered = countries.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.dial.includes(search)
    );
    
    const container = document.getElementById('countriesContainer');
    let html = '';
    filtered.forEach(country => {
        html += `<div class="country-item" onclick="selectCountry('${country.code}')">
            <span>${country.flag}</span>
            <span style="flex: 1;">${country.name}</span>
            <span style="color: var(--text-muted); font-size: 13px;">${country.dial}</span>
        </div>`;
    });
    container.innerHTML = html;
};

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const select = document.getElementById('countrySelect');
    if (select && !select.contains(e.target)) {
        const dropdown = document.getElementById('countryDropdown');
        const trigger = document.querySelector('.country-trigger');
        if (dropdown) dropdown.classList.remove('show');
        if (trigger) trigger.classList.remove('active');
    }
});

/* ========================================
   Password Toggle
   ======================================== */
window.togglePassword = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
};

/* ========================================
   Helper Functions
   ======================================== */
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(date) {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(date) {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now - d;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return minutes + 'د';
    if (hours < 24) return hours + 'س';
    if (days < 7) return days + 'ي';
    
    return d.getDate() + '/' + (d.getMonth() + 1);
}

function createAvatarHtml(name, avatar) {
    if (avatar) {
        return `<img src="${avatar}" alt="${name}">`;
    }
    const initials = getInitials(name);
    return `<span class="avatar-placeholder">${initials}</span>`;
}

/* ========================================
   User Data Functions
   ======================================== */
async function loadCurrentUser() {
    return new Promise((resolve) => {
        const auth = window.firebaseAuth;
        if (!auth) {
            resolve(null);
            return;
        }
        
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadUserData(user.uid);
                resolve(user);
            } else {
                currentUser = null;
                resolve(null);
            }
        });
    });
}

async function loadUserData(userId) {
    try {
        const db = window.firebaseDb;
        const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const q = query(collection(db, 'users'), where('uid', '==', userId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                currentUserData = { id: doc.id, ...doc.data() };
            });
        }
        
        return currentUserData;
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
}

function updateUserUI(userData) {
    // Update user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl && userData) {
        userNameEl.textContent = userData.fullName || userData.username || 'المستخدم';
    }
    
    // Update user avatar
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl && userData) {
        if (userData.avatar) {
            userAvatarEl.innerHTML = `<img src="${userData.avatar}" alt="">`;
        } else {
            const initials = getInitials(userData.fullName);
            userAvatarEl.textContent = initials;
        }
    }
    
    // Update display name in settings
    const displayFullName = document.getElementById('displayFullName');
    const displayUsername = document.getElementById('displayUsername');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (displayFullName && userData) {
        displayFullName.textContent = userData.fullName || 'المستخدم';
    }
    if (displayUsername && userData) {
        displayUsername.textContent = '@' + (userData.username || 'user');
    }
    if (profileAvatar && userData) {
        if (userData.avatar) {
            profileAvatar.innerHTML = `<img src="${userData.avatar}" alt="">`;
        } else {
            const initials = getInitials(userData.fullName);
            profileAvatar.innerHTML = `<span class="profile-avatar-placeholder">${initials}</span>`;
        }
    }
}

/* ========================================
   Modal Functions
   ======================================== */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function closeModalOnOverlay(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
}

window.showModal = showModal;
window.hideModal = hideModal;

/* ========================================
   Confirm Dialog
   ======================================== */
let currentAction = null;

window.showConfirm = function(options) {
    const overlay = document.getElementById('confirmOverlay');
    if (!overlay) return;
    
    const icon = document.getElementById('confirmIcon');
    const title = document.getElementById('confirmTitle');
    const message = document.getElementById('confirmMessage');
    const btn = document.getElementById('confirmBtn');
    
    currentAction = options.onConfirm;
    
    if (icon) {
        icon.className = 'confirm-icon ' + (options.type || 'info');
        icon.textContent = options.icon || '⚠️';
    }
    if (title) title.textContent = options.title || 'تأكيد';
    if (message) message.textContent = options.message || 'هل أنت متأكد؟';
    if (btn) {
        btn.className = 'confirm-btn confirm ' + (options.btnClass || 'primary');
        btn.textContent = options.btnText || 'تأكيد';
    }
    
    overlay.classList.add('show');
};

window.hideConfirm = function() {
    const overlay = document.getElementById('confirmOverlay');
    if (overlay) overlay.classList.remove('show');
    currentAction = null;
};

window.confirmAction = function() {
    if (currentAction) {
        currentAction();
    }
    window.hideConfirm();
};

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
    if (e.target.id === 'confirmOverlay') {
        window.hideConfirm();
    }
});

/* ========================================
   Slider Functions (Home Page)
   ======================================== */
let currentSlide = 0;
let totalSlides = 0;
let slideInterval;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Create dots
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.onclick = function() { goToSlide(i); };
            dotsContainer.appendChild(dot);
        }
    }
    
    // Start auto-play
    slideInterval = setInterval(nextSlide, 3000);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const wrapper = document.getElementById('sliderWrapper');
    if (wrapper) {
        wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Touch/Swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        } else {
            currentSlide = (currentSlide + 1) % totalSlides;
        }
        updateSlider();
    }
}

/* ========================================
   Home Page Functions
   ======================================== */
function renderSpeakers() {
    const c = document.getElementById('speakersContainer');
    if (!c) return;
    
    const speakers = [
        {name: 'الشيخ محمد العريفي', title: 'عالم دين', avatar: 'https://i.pravatar.cc/150?img=11'},
        {name: 'الشيخ صالح المغامسي', title: 'إمام مسجد', avatar: 'https://i.pravatar.cc/150?img=13'},
        {name: 'الشيخ Abdulرحمن السديس', title: 'خطيب', avatar: 'https://i.pravatar.cc/150?img=15'},
        {name: 'الشيخ سعود الشريم', title: 'قارئ', avatar: 'https://i.pravatar.cc/150?img=17'}
    ];
    
    speakers.forEach(s => {
        const c2 = document.createElement('div');
        c2.className = 'speaker-card';
        c2.innerHTML = `<div class="speaker-avatar"><img src="${s.avatar}" alt="${s.name}"></div><div class="speaker-name">${s.name}</div><div class="speaker-title">${s.title}</div><button class="follow-btn" onclick="this.classList.toggle('following');this.textContent=this.classList.contains('following')?'متابع':'متابعة';showToast(this.classList.contains('following')?'تمت المتابعة':'تم إلغاء المتابعة')">متابعة</button>`;
        c.appendChild(c2);
    });
}

function renderVideos() {
    const c = document.getElementById('videosContainer');
    if (!c) return;
    
    const videos = [
        {title: 'فضل صيام يوم عرفة', thumb: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', dur: '15:30', auth: 'الشيخ العريفي', views: '125K'},
        {title: 'شرح حديث: إنما الأعمال بالنيات', thumb: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400', dur: '22:45', auth: 'الشيخ المغامسي', views: '89K'}
    ];
    
    videos.forEach(v => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'video-card';
        a.onclick = e => { e.preventDefault(); showToast('جاري تشغيل'); };
        a.innerHTML = `<div class="video-thumbnail"><img src="${v.thumb}" alt="${v.title}"><span class="video-duration">${v.dur}</span><div class="play-btn">▶</div></div><div class="video-info"><div class="video-title">${v.title}</div><div class="video-meta"><span>${v.auth}</span><span>•</span><span>${v.views} مشاهدة</span></div></div>`;
        c.appendChild(a);
    });
}

window.showCreateRoomModal = function() {
    const n = prompt('اسم الغرفة:');
    if (n) showToast('تم إنشاء: ' + n);
};

/* ========================================
   Chat Page Functions
   ======================================== */
window.switchChatTab = function(tabName, tab) {
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
};

window.showCreateRoomModalChat = function() {
    const name = prompt('اسم الغرفة:');
    if(name) showToast('تم إنشاء: ' + name);
};

/* ========================================
   Friends Page Functions
   ======================================== */
window.switchFriendsTab = function(tabName, card) {
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
};

function initFriendsPage() {
    const friendsList = document.getElementById('friendsList');
    const pendingList = document.getElementById('pendingList');
    const sentList = document.getElementById('sentList');
    const blockedList = document.getElementById('blockedList');
    
    if (friendsList) friendsList.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">لا يوجد أصدقاء بعد</div></div>';
    if (pendingList) pendingList.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-title">لا توجد طلبات</div></div>';
    if (sentList) sentList.innerHTML = '<div class="empty-state"><div class="empty-icon">📤</div><div class="empty-title">لا توجد طلبات مرسلة</div></div>';
    if (blockedList) blockedList.innerHTML = '<div class="empty-state"><div class="empty-icon">🚫</div><div class="empty-title">لا يوجد محظورين</div></div>';
}

/* ========================================
   Settings Page Functions
   ======================================== */
window.saveProfile = function(e) {
    e.preventDefault();
    showToast('تم حفظ المعلومات');
};

window.logout = function() {
    showToast('جاري تسجيل الخروج...');
    setTimeout(() => window.location.href = 'index.html', 1000);
};

/* ========================================
   Login Page Functions (Index)
   ======================================== */
window.handleLogin = async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showToast('يرجى إدخال اسم المستخدم وكلمة المرور', true);
        return;
    }
    
    setLoading('loginBtn', 'loginSpinner', true);
    
    try {
        const { db, auth } = window;
        const { collection, query, where, getDocs } = window.firestoreFunctions;
        const { signInWithEmailAndPassword } = window.authFunctions;
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            showToast('اسم المستخدم غير صحيح', true);
            setLoading('loginBtn', 'loginSpinner', false);
            return;
        }
        
        let userEmail = null;
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            userEmail = userData.authEmail;
        });
        
        if (!userEmail) {
            showToast('حدث خطأ في تسجيل الدخول', true);
            setLoading('loginBtn', 'loginSpinner', false);
            return;
        }
        
        await signInWithEmailAndPassword(auth, userEmail, password);
        
        showToast('تم تسجيل الدخول بنجاح!');
        
        setTimeout(function() {
            window.location.href = 'home.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'فشل تسجيل الدخول';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'المستخدم غير موجود';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'كلمة المرور غير صحيحة';
        }
        
        showToast(errorMessage, true);
    } finally {
        setLoading('loginBtn', 'loginSpinner', false);
    }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const syntheticEmail = username + '@app.local';
    
    if (password !== confirmPassword) {
        document.getElementById('passwordMatchError').classList.add('show');
        showToast('كلمات المرور غير متطابقة', true);
        return;
    } else {
        document.getElementById('passwordMatchError').classList.remove('show');
    }
    
    setLoading('registerBtn', 'registerSpinner', true);
    
    try {
        const { db, auth } = window;
        const { collection, addDoc, query, where, getDocs } = window.firestoreFunctions;
        const { createUserWithEmailAndPassword, updateProfile } = window.authFunctions;
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            showToast('اسم المستخدم مستخدم بالفعل', true);
            setLoading('registerBtn', 'registerSpinner', false);
            return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
            displayName: fullName
        });
        
        const userData = {
            uid: user.uid,
            fullName: fullName,
            username: username,
            authEmail: syntheticEmail,
            password: password,
            birthDate: birthDate,
            country: selectedCountry.name,
            countryCode: selectedCountry.code,
            phoneCode: selectedCountry.dial,
            phoneNumber: phoneNumber,
            createdAt: new Date(),
            isActive: true,
            isBlocked: false,
            lastLogin: new Date()
        };
        
        await addDoc(collection(db, 'users'), userData);
        
        showToast('تم إنشاء الحساب بنجاح!');
        
        setTimeout(function() {
            window.location.href = 'home.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'فشل إنشاء الحساب';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'اسم المستخدم مستخدم بالفعل';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)';
        }
        
        showToast(errorMessage, true);
    } finally {
        setLoading('registerBtn', 'registerSpinner', false);
    }
};

window.switchLoginTab = function(tab, element) {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.form-section');
    
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
};

/* ========================================
   Initialize App
   ======================================== */
async function initApp() {
    // Initialize theme
    initTheme();
    
    // Initialize Firebase
    await initFirebase();
    
    // Render countries if element exists
    if (document.getElementById('countriesContainer')) {
        renderCountries();
    }
    
    // Initialize slider if elements exist
    if (document.getElementById('sliderWrapper')) {
        initSlider();
    }
    
    // Render speakers and videos for home page
    if (document.getElementById('speakersContainer')) {
        renderSpeakers();
    }
    if (document.getElementById('videosContainer')) {
        renderVideos();
    }
    
    // Initialize friends page
    if (document.getElementById('friendsList')) {
        initFriendsPage();
    }
    
    // Load user data if authenticated
    await loadCurrentUser();
    if (currentUserData) {
        updateUserUI(currentUserData);
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export functions to window
window.App = {
    initFirebase,
    loadCurrentUser,
    loadUserData,
    updateUserUI,
    showToast,
    setLoading,
    switchTab,
    showModal,
    hideModal,
    getInitials,
    formatDate,
    formatTime,
    createAvatarHtml,
    initSlider,
    renderSpeakers,
    renderVideos,
    showCreateRoomModal
};


