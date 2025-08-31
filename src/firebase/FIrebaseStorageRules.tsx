//  {
//    "rules": {
//    ".read": true,
//      ".write": true
//    }
//  }
//------------only authenticated users --------------------
//{
//  "rules": {
//    ".read": "auth != null",
 //   ".write": "auth != null"
 // }
//}

import { firestore } from "firebase-admin"

//----------------------------------- ensures that users can only read and write data within their own user node.----------------- 
//  {
//  "rules": {
//    ".read": "auth != null",
//    ".write": "auth != null",
//    "users": {
//      "$uid": {
//        ".read": "$uid === auth.uid",
//        ".write": "$uid === auth.uid"
//      }
//    }
//  }
// } 

// rules_version = '2';

// // Craft rules based on data in your Firestore database
// // allow write: if firestore.get(
// //    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
// //     allow read, write: if false;
//    //   allow read, write: if request.auth != null;
//    allow read, write: if request.auth != null && request.auth.uid == userId; //for anonymous enabled
//     }
//   }
// }
 //----------------------------------- authorized user no anonymous .----------------- 
/*  {
  "rules": {
    "users": {
      "$userId": {
        ".read":  "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
//*********************************** */
*/
//for firestore
//rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
//service firebase.storage {
 // match /b/{bucket}/o {
  //  match /{allPaths=**} {
//     allow read, write: if false;
   //   allow read, write: if request.auth != null;
  // allow read, write: if request.auth != null && request.auth.uid == userId; //for anonymous enabled
 //   }
//  }
//}
//*******************************************************************

//rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {

//     // Users can read/write only their own files under users/{uid}/...
//     match /users/{userId}/{allPaths=**} {
//       allow read, write: if request.auth != null
//                          && request.auth.uid == userId;
//     }

//     // (Optional) Public, read-only files
//     match /public/{allPaths=**} {
//       allow read: if true;
//       allow write: if false;
//     }

//     // Default deny everything else
//     match /{allPaths=**} {
//       allow read, write: if false;
//     }
//   }
// }