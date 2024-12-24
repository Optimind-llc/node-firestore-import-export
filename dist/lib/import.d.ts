import { anyFirebaseRef } from './firestore-helpers';
import { ICollection } from '../interfaces/ICollection';
import { CollectionReference } from 'firebase-admin/firestore';
declare const importData: (data: any, startingRef: anyFirebaseRef, mergeWithExisting?: boolean, logs?: boolean) => Promise<any>;
declare const setDocuments: (data: ICollection, startingRef: CollectionReference, mergeWithExisting?: boolean, logs?: boolean) => Promise<any>;
export default importData;
export { setDocuments };
