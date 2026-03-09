
# كود Firebase Firestore Rules

انسخ هذا الكود وضعه في Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // المستخدمون
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // طلبات الصداقة
    match /friendRequests/{requestId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // الأصدقاء
    match /friends/{friendId} {
      allow read, create: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // غرف الدردشة
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
      
      // رسائل الغرف
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // الرسائل الخاصة
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // طلبات الانضمام
    match /roomJoinRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
  }
}
```

**خطوات:**
1. اذهب لـ Firebase Console
2. اختر Firestore Database
3. اضغط Rules
4. احذف كل شي وضع هذا الكود
5. اضغط Publish

