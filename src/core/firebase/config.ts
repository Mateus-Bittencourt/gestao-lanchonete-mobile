import { FirebaseApp, initializeApp, getApps } from '@react-native-firebase/app';
import authModule, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestoreModule, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

let app: FirebaseApp | undefined;

export function initFirebase(): void {
  try {
    if (!getApps().length) {
      // Relies on native google-services config present in each platform.
      app = initializeApp();
    } else {
      app = getApps()[0]! as FirebaseApp;
    }
  } catch (e) {
    // If not configured, keep undefined and use local-only fallbacks
    app = undefined;
  }
}

export function isFirebaseAvailable(): boolean {
  return !!app;
}

export function auth(): FirebaseAuthTypes.Module | undefined {
  try {
    return authModule();
  } catch {
    return undefined;
  }
}

export function firestore(): FirebaseFirestoreTypes.Module | undefined {
  try {
    return firestoreModule();
  } catch {
    return undefined;
  }
}
