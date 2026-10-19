/**
 * @file firebase-admin.ts
 * @description Server-side Firebase Admin SDK initialization using static JSON configuration.
 * @author s-reinmar
 * @license MIT
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = getAuth();
