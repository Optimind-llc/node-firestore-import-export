import * as admin from 'firebase-admin';
import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
declare const exportData: (startingRef: admin.firestore.Firestore | DocumentReference | CollectionReference, logs?: boolean) => Promise<any>;
export default exportData;
