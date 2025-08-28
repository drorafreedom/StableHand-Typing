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

//----------------------------------- ensures that users can only read and write data within their own user node.----------------- 
{
 "rules": {
   ".read": "auth != null",
   ".write": "auth != null",
   "users": {
     "$uid": {
       ".read": "$uid === auth.uid",
       ".write": "$uid === auth.uid"
     }
   }
 }
}