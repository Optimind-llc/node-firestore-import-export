import * as admin from 'firebase-admin';
import loadJsonFile from 'load-json-file';
import {IFirebaseCredentials} from '../interfaces/IFirebaseCredentials';
import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';

const SLEEP_TIME = 1000;

const getCredentialsFromFile = (credentialsFilename: string): Promise<IFirebaseCredentials> => {
  return loadJsonFile(credentialsFilename);
};

const getFirestoreDBReference = (credentials: IFirebaseCredentials): admin.firestore.Firestore => {
  admin.initializeApp({
    credential: admin.credential.cert(credentials as any),
    databaseURL: `https://${(credentials as any).project_id}.firebaseio.com`,
  });

  return admin.firestore();
};

const getDBReferenceFromPath = (db: admin.firestore.Firestore, dataPath?: string): admin.firestore.Firestore |
  DocumentReference |
  CollectionReference => {
  let startingRef;
  if (dataPath) {
    const parts = dataPath.split('/').length;
    const isDoc = parts % 2 === 0;
    startingRef = isDoc ? db.doc(dataPath) : db.collection(dataPath);
  } else {
    startingRef = db;
  }
  return startingRef;
};

const isLikeDocument = (ref: admin.firestore.Firestore |
  DocumentReference |
  CollectionReference): ref is DocumentReference => {
  return (<DocumentReference>ref).collection !== undefined;
};

const isRootOfDatabase = (ref: admin.firestore.Firestore |
  DocumentReference |
  CollectionReference): ref is admin.firestore.Firestore => {
  return (<admin.firestore.Firestore>ref).batch !== undefined;
};

const sleep = (timeInMS: number): Promise<void> => new Promise(resolve => setTimeout(resolve, timeInMS));

const batchExecutor = async function <T>(promises: Promise<T>[], batchSize: number = 50) {
  const res: T[] = [];
  while (promises.length > 0) {
    const temp = await Promise.all(promises.splice(0, batchSize));
    res.push(...temp);
  }
  return res;
};

const safelyGetCollectionsSnapshot = async (startingRef: admin.firestore.Firestore | DocumentReference, logs = false): Promise<CollectionReference[]> => {
  let collectionsSnapshot, deadlineError = false;
  do {
    try {
      collectionsSnapshot = await startingRef.listCollections();
      deadlineError = false;
    } catch (e) {
      if ((e as any).message === 'Deadline Exceeded') {
        logs && console.log(`Deadline Error in getCollections()...waiting ${SLEEP_TIME / 1000} second(s) before retrying`);
        await sleep(SLEEP_TIME);
        deadlineError = true;
      } else {
        throw e;
      }
    }
  } while (deadlineError || !collectionsSnapshot);
  return collectionsSnapshot;
};

const safelyGetDocumentReferences = async (collectionRef: CollectionReference, logs = false): Promise<DocumentReference[]> => {
  let allDocuments, deadlineError = false;
  do {
    try {
      allDocuments = await collectionRef.listDocuments();
      deadlineError = false;
    } catch (e) {
      if ((e as any).code && (e as any).code === 4) {
        logs && console.log(`Deadline Error in getDocuments()...waiting ${SLEEP_TIME / 1000} second(s) before retrying`);
        await sleep(SLEEP_TIME);
        deadlineError = true;
      } else {
        throw e;
      }
    }
  } while (deadlineError || !allDocuments);
  return allDocuments;
};

type anyFirebaseRef = admin.firestore.Firestore |
  DocumentReference |
  CollectionReference

export {
  getCredentialsFromFile,
  getFirestoreDBReference,
  getDBReferenceFromPath,
  isLikeDocument,
  isRootOfDatabase,
  sleep,
  batchExecutor,
  anyFirebaseRef,
  safelyGetCollectionsSnapshot,
  safelyGetDocumentReferences,
};
