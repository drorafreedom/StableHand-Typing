// Import the Firebase Admin SDK
import admin from 'firebase-admin';
import fs from 'fs';

// Import the service account key
import serviceAccount from './stable-b543e-firebase-adminsdk-f1cry-baf5885868.json' assert { type: 'json' };

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const auth = admin.auth();

// Function to delete anonymous users
async function deleteAnonymousUsers(): Promise<void> {
  const maxResults = 1000; // Maximum allowed by Firebase
  let usersToDelete: string[] = [];

  // List all users and filter anonymous users
  async function listAllUsers(nextPageToken?: string): Promise<void> {
    try {
      const listUsersResult = await auth.listUsers(maxResults, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        if (userRecord.providerData.length === 0) {
          // User is anonymous
          usersToDelete.push(userRecord.uid);
        }
      });
      if (listUsersResult.pageToken) {
        // Continue listing users with nextPageToken
        await listAllUsers(listUsersResult.pageToken);
      } else {
        console.log(`Total anonymous users to delete: ${usersToDelete.length}`);
        await deleteUsersBatch(usersToDelete);
      }
    } catch (error) {
      console.error('Error listing users:', error);
    }
  }

  // Function to delete users in batches of 1000
  async function deleteUsersBatch(uids: string[]): Promise<void> {
    const chunkSize = 1000; // Firebase allows max 1000 deletions at once
    for (let i = 0; i < uids.length; i += chunkSize) {
      const chunk = uids.slice(i, i + chunkSize);
      try {
        const deleteUsersResult = await auth.deleteUsers(chunk);
        console.log(`Successfully deleted ${deleteUsersResult.successCount} users.`);
        if (deleteUsersResult.failureCount > 0) {
          console.log('Failed to delete some users:');
          deleteUsersResult.errors.forEach((err) => {
            console.error(err.error.toJSON());
          });
        }
      } catch (error) {
        console.error('Error deleting users:', error);
      }
    }
  }

  // Start listing users
  await listAllUsers();
}

// Execute the function
deleteAnonymousUsers()
  .then(() => {
    console.log('Finished deleting anonymous users.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deleting anonymous users:', error);
    process.exit(1);
  });

//+++++++++++JS version+++++++++++++++++
/*     // deleteAnonymousUsers.js
  // JS version
// Import the Firebase Admin SDK
import admin from 'firebase-admin';
import fs from 'fs';

// Import the service account key
import serviceAccount from './stable-b543e-firebase-adminsdk-f1cry-baf5885868.json' assert { type: 'json' };

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Function to delete anonymous users
async function deleteAnonymousUsers() {
  const maxResults = 1000; // Maximum allowed by Firebase
  let usersToDelete = [];

  // List all users and filter anonymous users
  async function listAllUsers(nextPageToken) {
    try {
      const listUsersResult = await auth.listUsers(maxResults, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        if (userRecord.providerData.length === 0) {
          // User is anonymous
          usersToDelete.push(userRecord.uid);
        }
      });
      if (listUsersResult.pageToken) {
        // Continue listing users with nextPageToken
        await listAllUsers(listUsersResult.pageToken);
      } else {
        console.log(`Total anonymous users to delete: ${usersToDelete.length}`);
        await deleteUsersBatch(usersToDelete);
      }
    } catch (error) {
      console.error('Error listing users:', error);
    }
  }

  // Function to delete users in batches of 1000
  async function deleteUsersBatch(uids) {
    const chunkSize = 1000; // Firebase allows max 1000 deletions at once
    for (let i = 0; i < uids.length; i += chunkSize) {
      const chunk = uids.slice(i, i + chunkSize);
      try {
        const deleteUsersResult = await auth.deleteUsers(chunk);
        console.log(`Successfully deleted ${deleteUsersResult.successCount} users.`);
        if (deleteUsersResult.failureCount > 0) {
          console.log('Failed to delete some users:');
          deleteUsersResult.errors.forEach((err) => {
            console.error(err.error.toJSON());
          });
        }
      } catch (error) {
        console.error('Error deleting users:', error);
      }
    }
  }

  // Start listing users
  await listAllUsers();
}

// Execute the function
deleteAnonymousUsers()
  .then(() => {
    console.log('Finished deleting anonymous users.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deleting anonymous users:', error);
    process.exit(1);
  });
 */

// src\utils\deleteAnonymousUsers.js
/* 
const admin = require('firebase-admin');

// Replace './serviceAccountKey.json' with the path to your downloaded JSON key file
const serviceAccount = require('./stable-b543e-firebase-adminsdk-f1cry-baf5885868.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Function to delete anonymous users
async function deleteAnonymousUsers() {
  const maxResults = 1000; // Maximum allowed by Firebase
  let usersToDelete = [];

  // List all users and filter anonymous users
  async function listAllUsers(nextPageToken) {
    try {
      const listUsersResult = await auth.listUsers(maxResults, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        if (userRecord.providerData.length === 0) {
          // User is anonymous
          usersToDelete.push(userRecord.uid);
        }
      });
      if (listUsersResult.pageToken) {
        // Continue listing users with nextPageToken
        await listAllUsers(listUsersResult.pageToken);
      } else {
        console.log(`Total anonymous users to delete: ${usersToDelete.length}`);
        await deleteUsersBatch(usersToDelete);
      }
    } catch (error) {
      console.error('Error listing users:', error);
    }
  }

  // Function to delete users in batches of 1000
  async function deleteUsersBatch(uids) {
    const chunkSize = 1000; // Firebase allows max 1000 deletions at once
    for (let i = 0; i < uids.length; i += chunkSize) {
      const chunk = uids.slice(i, i + chunkSize);
      try {
        const deleteUsersResult = await auth.deleteUsers(chunk);
        console.log(`Successfully deleted ${deleteUsersResult.successCount} users.`);
        if (deleteUsersResult.failureCount > 0) {
          console.log('Failed to delete some users:');
          deleteUsersResult.errors.forEach((err) => {
            console.error(err.error.toJSON());
          });
        }
      } catch (error) {
        console.error('Error deleting users:', error);
      }
    }
  }

  // Start listing users
  await listAllUsers();
}

// Execute the function
deleteAnonymousUsers()
  .then(() => {
    console.log('Finished deleting anonymous users.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deleting anonymous users:', error);
    process.exit(1);
  });
 */

//---------------------------------------------------------------------
