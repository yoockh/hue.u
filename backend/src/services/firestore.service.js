const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const env = require('../config/env');

// Scan-history persistence on Firestore. The Admin app is initialized lazily on
// first use (and only once) so importing this module never trips over missing
// credentials at load time.
const COLLECTION = 'scan_history';

let db = null;

function getDb() {
  if (!db) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY
        })
      });
    }
    db = getFirestore();
  }
  return db;
}

// Persist one analysis result. `result` is the same object the controller
// returns to the client: { analysis, classification, recommendations }.
// `photoUrl` is the Cloudinary-hosted original photo (null if the upload failed).
async function saveScan(result, photoUrl = null) {
  const doc = {
    season: result.classification.season,
    undertone: result.classification.undertone,
    contrast: result.classification.contrast,
    palette: result.recommendations.palette || [],
    explanation: result.recommendations.explanation || null,
    skin_color: result.analysis.skin_color || null,
    hair_color: result.analysis.hair_color || null,
    eye_color: result.analysis.eye_color || null,
    photo_url: photoUrl || null,
    createdAt: FieldValue.serverTimestamp()
  };

  const ref = await getDb().collection(COLLECTION).add(doc);
  return ref.id;
}

// List scan history, newest first. createdAt is returned as an ISO string so the
// response is plain JSON (Firestore Timestamps don't serialize directly).
async function getHistory(max = 50) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(max)
    .get();

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      season: data.season,
      undertone: data.undertone,
      contrast: data.contrast,
      palette: data.palette || [],
      explanation: data.explanation || null,
      skin_color: data.skin_color || null,
      hair_color: data.hair_color || null,
      eye_color: data.eye_color || null,
      createdAt: data.createdAt && data.createdAt.toDate
        ? data.createdAt.toDate().toISOString()
        : null
    };
  });
}

module.exports = { saveScan, getHistory };
