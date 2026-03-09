// Firebase Functions - الملف المشترك للجميع
// يتضمن وظائف Firebase وجلب البيانات وإدارة الأصدقاء والدردشة

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDVP5IRHetBo7JDSRLteQOFX4fhsts3ur0",
    authDomain: "chat-94032.firebaseapp.com",
    projectId: "chat-94032",
    storageBucket: "chat-94032.firebasestorage.app",
    messagingSenderId: "920803161623",
    appId: "1:920803161623:web:a2995a99c07b42af1d0e52"
};

// تهيئة Firebase إذا لم تكن مهيأة
let app, db, auth;

async function initFirebase() {
    if (!window.firebaseApps || window.firebaseApps.length === 0) {
        const { initializeApp: initApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        app = initApp(firebaseConfig);
    } else {
        app = window.firebaseApps[0];
    }
    
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    
    db = getFirestore(app);
    auth = getAuth(app);
    
    window.firebaseDb = db;
    window.firebaseAuth = auth;
    
    return { db, auth };
}

// متغيرات عامة
let currentUser = null;
let currentUserData = null;

// ==========================================
// وظائف المستخدمين
// ==========================================

// جلب جميع المستخدمين (ما عدا المستخدم الحالي)
async function getAllUsers() {
    try {
        const { db } = await initFirebase();
        const { getDocs, collection, query, where } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        let users = [];
        
        if (currentUser) {
            const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
        } else {
            const snapshot = await getDocs(collection(db, 'users'));
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
        }
        
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// جلب بيانات المستخدم الحالي
async function getCurrentUserData() {
    try {
        const { db } = await initFirebase();
        const auth = window.firebaseAuth;
        
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    currentUser = user;
                    const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                    
                    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                    const snapshot = await getDocs(q);
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            currentUserData = { id: doc.id, ...doc.data() };
                            resolve(currentUserData);
                        });
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    } catch (error) {
        console.error('Error getting current user data:', error);
        return null;
    }
}

// ==========================================
// نظام الأصدقاء
// ==========================================

// إرسال طلب صداقة
async function sendFriendRequest(userId, userName, userAvatar) {
    try {
        const { db } = await initFirebase();
        const { addDoc, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser || !currentUserData) {
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            return false;
        }
        
        // إضافة الطلب في مجموعة طلبات الصداقة
        await addDoc(collection(db, 'friendRequests'), {
            fromUid: currentUser.uid,
            fromName: currentUserData.fullName,
            fromUsername: currentUserData.username,
            fromAvatar: currentUserData.avatar || null,
            toUid: userId,
            toName: userName,
            toAvatar: userAvatar,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        
        showToast('تم إرسال طلب الصداقة');
        return true;
    } catch (error) {
        console.error('Error sending friend request:', error);
        showToast('فشل إرسال الطلب', 'error');
        return false;
    }
}

// قبول طلب الصداقة
async function acceptFriendRequest(requestId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc, collection, addDoc, serverTimestamp, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        // تحديث حالة الطلب
        await updateDoc(doc(db, 'friendRequests', requestId), {
            status: 'accepted',
            acceptedAt: serverTimestamp()
        });
        
        // إضافة كلاكما كصدقاء في قائمة الأصدقاء
        const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
        const requestData = requestDoc.data();
        
        // إضافة صديق للمستخدم الأول
        await addDoc(collection(db, 'friends'), {
            userId: requestData.fromUid,
            friendId: requestData.toUid,
            friendName: requestData.toName,
            friendUsername: requestData.toUsername,
            friendAvatar: requestData.toAvatar,
            addedAt: serverTimestamp()
        });
        
        // إضافة صديق للمستخدم الثاني
        await addDoc(collection(db, 'friends'), {
            userId: requestData.toUid,
            friendId: requestData.fromUid,
            friendName: requestData.fromName,
            friendUsername: requestData.fromUsername,
            friendAvatar: requestData.fromAvatar,
            addedAt: serverTimestamp()
        });
        
        showToast('تم قبول طلب الصداقة');
        return true;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        showToast('فشل قبول الطلب', 'error');
        return false;
    }
}

// رفض طلب الصداقة
async function declineFriendRequest(requestId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        await updateDoc(doc(db, 'friendRequests', requestId), {
            status: 'rejected',
            rejectedAt: new Date()
        });
        
        showToast('تم رفض الطلب');
        return true;
    } catch (error) {
        console.error('Error declining friend request:', error);
        showToast('فشل رفض الطلب', 'error');
        return false;
    }
}

// جلب طلبات الصداقة الواردة
async function getFriendRequests() {
    try {
        const { db } = await initFirebase();
        const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return [];
        
        const q = query(
            collection(db, 'friendRequests'),
            where('toUid', '==', currentUser.uid),
            where('status', '==', 'pending')
        );
        
        const snapshot = await getDocs(q);
        let requests = [];
        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        
        return requests;
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return [];
    }
}

// جلب قائمة الأصدقاء
async function getFriends() {
    try {
        const { db } = await initFirebase();
        const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return [];
        
        const q = query(collection(db, 'friends'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        let friends = [];
        snapshot.forEach(doc => {
            friends.push({ id: doc.id, ...doc.data() });
        });
        
        return friends;
    } catch (error) {
        console.error('Error getting friends:', error);
        return [];
    }
}

// التحقق من حالة الصداقة
async function getFriendshipStatus(userId) {
    try {
        const { db } = await initFirebase();
        const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return 'none';
        
        // البحث عن صداقة موجودة
        const q = query(
            collection(db, 'friends'),
            where('userId', '==', currentUser.uid),
            where('friendId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return 'friends';
        
        // البحث عن طلب صداقة مرسل
        const q2 = query(
            collection(db, 'friendRequests'),
            where('fromUid', '==', currentUser.uid),
            where('toUid', '==', userId),
            where('status', '==', 'pending')
        );
        
        const snapshot2 = await getDocs(q2);
        if (!snapshot2.empty) return 'sent';
        
        // البحث عن طلب وارد
        const q3 = query(
            collection(db, 'friendRequests'),
            where('toUid', '==', currentUser.uid),
            where('fromUid', '==', userId),
            where('status', '==', 'pending')
        );
        
        const snapshot3 = await getDocs(q3);
        if (!snapshot3.empty) return 'received';
        
        return 'none';
    } catch (error) {
        console.error('Error getting friendship status:', error);
        return 'none';
    }
}

// ==========================================
// نظام الدردشة
// ==========================================

// إنشاء غرفة دردشة جماعية
async function createChatRoom(roomName, roomDescription) {
    try {
        const { db } = await initFirebase();
        const { addDoc, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser || !currentUserData) {
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            return null;
        }
        
        const roomData = await addDoc(collection(db, 'chatRooms'), {
            name: roomName,
            description: roomDescription,
            creatorId: currentUser.uid,
            creatorName: currentUserData.fullName,
            members: [currentUser.uid],
            admins: [currentUser.uid], // المنشئ هو أيضاً مدير
            createdAt: serverTimestamp(),
            isGroup: true,
            lastMessage: '',
            lastMessageTime: null
        });
        
        showToast('تم إنشاء الغرفة بنجاح');
        return roomData.id;
    } catch (error) {
        console.error('Error creating chat room:', error);
        showToast('فشل إنشاء الغرفة', 'error');
        return null;
    }
}

// الانضمام إلى غرفة دردشة
async function joinChatRoom(roomId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) {
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            return false;
        }
        
        await updateDoc(doc(db, 'chatRooms', roomId), {
            members: arrayUnion(currentUser.uid)
        });
        
        showToast('تم الانضمام للغرفة');
        return true;
    } catch (error) {
        console.error('Error joining chat room:', error);
        showToast('فشل الانضمام', 'error');
        return false;
    }
}

// مغادرة غرفة الدردشة
async function leaveChatRoom(roomId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc, arrayRemove } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return false;
        
        await updateDoc(doc(db, 'chatRooms', roomId), {
            members: arrayRemove(currentUser.uid),
            admins: arrayRemove(currentUser.uid)
        });
        
        showToast('تم مغادرة الغرفة');
        return true;
    } catch (error) {
        console.error('Error leaving chat room:', error);
        return false;
    }
}

// حذف عضو من الغرفة (للمدير فقط)
async function removeMemberFromRoom(roomId, memberId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc, arrayRemove } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        await updateDoc(doc(db, 'chatRooms', roomId), {
            members: arrayRemove(memberId),
            admins: arrayRemove(memberId)
        });
        
        showToast('تم حذف العضو من الغرفة');
        return true;
    } catch (error) {
        console.error('Error removing member:', error);
        showToast('فشل حذف العضو', 'error');
        return false;
    }
}

// منح صلاحيات المدير لمستخدم
async function makeAdmin(roomId, userId) {
    try {
        const { db } = await initFirebase();
        const { updateDoc, doc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        await updateDoc(doc(db, 'chatRooms', roomId), {
            admins: arrayUnion(userId)
        });
        
        showToast('تم منح الصلاحيات للمستخدم');
        return true;
    } catch (error) {
        console.error('Error making admin:', error);
        return false;
    }
}

// جلب غرف الدردشة
async function getChatRooms() {
    try {
        const { db } = await initFirebase();
        const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return [];
        
        // جلب الغرف التي يكون المستخدم عضواً فيها
        const snapshot = await getDocs(collection(db, 'chatRooms'));
        let rooms = [];
        
        snapshot.forEach(doc => {
            const roomData = doc.data();
            if (roomData.members && roomData.members.includes(currentUser.uid)) {
                rooms.push({ id: doc.id, ...roomData });
            }
        });
        
        return rooms;
    } catch (error) {
        console.error('Error getting chat rooms:', error);
        return [];
    }
}

// جلب جميع الغرف المتاحة (للانضمام)
async function getAvailableChatRooms() {
    try {
        const { db } = await initFirebase();
        const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const snapshot = await getDocs(collection(db, 'chatRooms'));
        let rooms = [];
        
        snapshot.forEach(doc => {
            const roomData = doc.data();
            // إظهار الغرف التي المستخدم ليس فيها
            if (!roomData.members || !roomData.members.includes(currentUser?.uid || '')) {
                rooms.push({ id: doc.id, ...roomData });
            }
        });
        
        return rooms;
    } catch (error) {
        console.error('Error getting available rooms:', error);
        return [];
    }
}

// ==========================================
// المحادثات الخاصة
// ==========================================

// إنشاء أو الوصول لمحادثة خاصة
async function getOrCreatePrivateChat(otherUserId, otherUserName, otherUserAvatar) {
    try {
        const { db } = await initFirebase();
        const { getDocs, collection, query, where, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return null;
        
        // البحث عن محادثة موجودة
        const participantString = [currentUser.uid, otherUserId].sort().join(',');
        const q = query(
            collection(db, 'privateChats'),
            where('participants', '==', participantString)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }
        
        // إنشاء محادثة جديدة
        const chatData = await addDoc(collection(db, 'privateChats'), {
            participants: participantString,
            participantDetails: {
                [currentUser.uid]: {
                    name: currentUserData.fullName,
                    avatar: currentUserData.avatar || null
                },
                [otherUserId]: {
                    name: otherUserName,
                    avatar: otherUserAvatar
                }
            },
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: null,
            isGroup: false
        });
        
        return chatData.id;
    } catch (error) {
        console.error('Error getting or creating private chat:', error);
        return null;
    }
}

// جلب المحادثات الخاصة
async function getPrivateChats() {
    try {
        const { db } = await initFirebase();
        const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return [];
        
        const snapshot = await getDocs(collection(db, 'privateChats'));
        let chats = [];
        
        snapshot.forEach(doc => {
            const chatData = doc.data();
            if (chatData.participants && chatData.participants.includes(currentUser.uid)) {
                chats.push({ id: doc.id, ...chatData });
            }
        });
        
        return chats;
    } catch (error) {
        console.error('Error getting private chats:', error);
        return [];
    }
}

// ==========================================
// إرسال الرسائل
// ==========================================

// إرسال رسالة إلى غرفة
async function sendMessageToRoom(roomId, message) {
    try {
        const { db } = await initFirebase();
        const { addDoc, collection, serverTimestamp, updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser || !currentUserData) return false;
        
        await addDoc(collection(db, 'messages'), {
            roomId: roomId,
            senderId: currentUser.uid,
            senderName: currentUserData.fullName,
            senderAvatar: currentUserData.avatar || null,
            message: message,
            type: 'room',
            createdAt: serverTimestamp()
        });
        
        // تحديث آخر رسالة في الغرفة
        await updateDoc(doc(db, 'chatRooms', roomId), {
            lastMessage: message,
            lastMessageTime: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

// إرسال رسالة خاصة
async function sendPrivateMessage(chatId, message) {
    try {
        const { db } = await initFirebase();
        const { addDoc, collection, serverTimestamp, updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser || !currentUserData) return false;
        
        await addDoc(collection(db, 'messages'), {
            chatId: chatId,
            senderId: currentUser.uid,
            senderName: currentUserData.fullName,
            senderAvatar: currentUserData.avatar || null,
            message: message,
            type: 'private',
            createdAt: serverTimestamp()
        });
        
        // تحديث آخر رسالة
        await updateDoc(doc(db, 'privateChats', chatId), {
            lastMessage: message,
            lastMessageTime: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Error sending private message:', error);
        return false;
    }
}

// ==========================================
// وظائف مساعدة
// ==========================================

// عرض الإشعار
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    let toastMessage = document.getElementById('toastMessage');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<span>✓</span><span id="toastMessage"></span>';
        document.body.appendChild(toast);
        toastMessage = document.getElementById('toastMessage');
    }
    
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// إنشاء صورة الملف الشخصي (initials)
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

// التحقق من صلاحيات المدير
async function isRoomAdmin(roomId) {
    try {
        const { db } = await initFirebase();
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!currentUser) return false;
        
        const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
        if (!roomDoc.exists()) return false;
        
        const roomData = roomDoc.data();
        return roomData.admins && roomData.admins.includes(currentUser.uid);
    } catch (error) {
        console.error('Error checking admin:', error);
        return false;
    }
}

// جلب تفاصيل المستخدم
async function getUserDetails(userId) {
    try {
        const { db } = await initFirebase();
        const { getDocs, query, where, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const q = query(collection(db, 'users'), where('uid', '==', userId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return snapshot.docs[0].data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user details:', error);
        return null;
    }
}

// ==========================================
// تصدير الوظائف للاستخدام العام
// ==========================================

window.AppFunctions = {
    initFirebase,
    getAllUsers,
    getCurrentUserData,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getFriendRequests,
    getFriends,
    getFriendshipStatus,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
    removeMemberFromRoom,
    makeAdmin,
    getChatRooms,
    getAvailableChatRooms,
    getOrCreatePrivateChat,
    getPrivateChats,
    sendMessageToRoom,
    sendPrivateMessage,
    showToast,
    getInitials,
    isRoomAdmin,
    getUserDetails
};

