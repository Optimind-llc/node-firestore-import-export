import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
declare const clearData: (startingRef: admin.firestore.Firestore | DocumentReference | CollectionReference, logs?: boolean) => Promise<any[]>;
export default clearData;
