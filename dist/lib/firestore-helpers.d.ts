import * as admin from 'firebase-admin';
import { IFirebaseCredentials } from '../interfaces/IFirebaseCredentials';
import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
declare const getCredentialsFromFile: (credentialsFilename: string) => Promise<IFirebaseCredentials>;
declare const getFirestoreDBReference: (credentials: IFirebaseCredentials) => admin.firestore.Firestore;
declare const getDBReferenceFromPath: (db: admin.firestore.Firestore, dataPath?: string) => admin.firestore.Firestore | DocumentReference | CollectionReference;
declare const isLikeDocument: (ref: admin.firestore.Firestore | DocumentReference | CollectionReference) => ref is DocumentReference;
declare const isRootOfDatabase: (ref: admin.firestore.Firestore | DocumentReference | CollectionReference) => ref is admin.firestore.Firestore;
declare const sleep: (timeInMS: number) => Promise<void>;
declare const batchExecutor: <T>(promises: Promise<T>[], batchSize?: number) => Promise<T[]>;
declare const safelyGetCollectionsSnapshot: (startingRef: admin.firestore.Firestore | DocumentReference, logs?: boolean) => Promise<CollectionReference[]>;
declare const safelyGetDocumentReferences: (collectionRef: CollectionReference, logs?: boolean) => Promise<DocumentReference[]>;
type anyFirebaseRef = admin.firestore.Firestore | DocumentReference | CollectionReference;
export { getCredentialsFromFile, getFirestoreDBReference, getDBReferenceFromPath, isLikeDocument, isRootOfDatabase, sleep, batchExecutor, anyFirebaseRef, safelyGetCollectionsSnapshot, safelyGetDocumentReferences, };