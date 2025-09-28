/**
 * Firestore Composable
 * Provides Firestore database instance and utilities
 */

import { getFirebaseFirestore } from '~/utils/firebase'

export function useFirestore() {
  // Initialize Firebase for both client and server
  const db = getFirebaseFirestore()

  return {
    db
  }
}