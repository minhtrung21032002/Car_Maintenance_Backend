// firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./thesis-268ea-firebase-adminsdk-2ebsu-eb74bf5ee3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

module.exports = { admin, auth };
