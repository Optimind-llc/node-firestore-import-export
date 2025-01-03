"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safelyGetDocumentReferences = exports.safelyGetCollectionsSnapshot = exports.batchExecutor = exports.sleep = exports.isRootOfDatabase = exports.isLikeDocument = exports.getDBReferenceFromPath = exports.getFirestoreDBReference = exports.getCredentialsFromFile = void 0;
const admin = __importStar(require("firebase-admin"));
const load_json_file_1 = __importDefault(require("load-json-file"));
const SLEEP_TIME = 1000;
const getCredentialsFromFile = (credentialsFilename) => {
    return (0, load_json_file_1.default)(credentialsFilename);
};
exports.getCredentialsFromFile = getCredentialsFromFile;
const getFirestoreDBReference = (credentials) => {
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
        databaseURL: `https://${credentials.project_id}.firebaseio.com`,
    });
    return admin.firestore();
};
exports.getFirestoreDBReference = getFirestoreDBReference;
const getDBReferenceFromPath = (db, dataPath) => {
    let startingRef;
    if (dataPath) {
        const parts = dataPath.split('/').length;
        const isDoc = parts % 2 === 0;
        startingRef = isDoc ? db.doc(dataPath) : db.collection(dataPath);
    }
    else {
        startingRef = db;
    }
    return startingRef;
};
exports.getDBReferenceFromPath = getDBReferenceFromPath;
const isLikeDocument = (ref) => {
    return ref.collection !== undefined;
};
exports.isLikeDocument = isLikeDocument;
const isRootOfDatabase = (ref) => {
    return ref.batch !== undefined;
};
exports.isRootOfDatabase = isRootOfDatabase;
const sleep = (timeInMS) => new Promise(resolve => setTimeout(resolve, timeInMS));
exports.sleep = sleep;
const batchExecutor = function (promises_1) {
    return __awaiter(this, arguments, void 0, function* (promises, batchSize = 50) {
        const res = [];
        while (promises.length > 0) {
            const temp = yield Promise.all(promises.splice(0, batchSize));
            res.push(...temp);
        }
        return res;
    });
};
exports.batchExecutor = batchExecutor;
const safelyGetCollectionsSnapshot = (startingRef_1, ...args_1) => __awaiter(void 0, [startingRef_1, ...args_1], void 0, function* (startingRef, logs = false) {
    let collectionsSnapshot, deadlineError = false;
    do {
        try {
            collectionsSnapshot = yield startingRef.listCollections();
            deadlineError = false;
        }
        catch (e) {
            if (e.message === 'Deadline Exceeded') {
                logs && console.log(`Deadline Error in getCollections()...waiting ${SLEEP_TIME / 1000} second(s) before retrying`);
                yield sleep(SLEEP_TIME);
                deadlineError = true;
            }
            else {
                throw e;
            }
        }
    } while (deadlineError || !collectionsSnapshot);
    return collectionsSnapshot;
});
exports.safelyGetCollectionsSnapshot = safelyGetCollectionsSnapshot;
const safelyGetDocumentReferences = (collectionRef_1, ...args_1) => __awaiter(void 0, [collectionRef_1, ...args_1], void 0, function* (collectionRef, logs = false) {
    let allDocuments, deadlineError = false;
    do {
        try {
            allDocuments = yield collectionRef.listDocuments();
            deadlineError = false;
        }
        catch (e) {
            if (e.code && e.code === 4) {
                logs && console.log(`Deadline Error in getDocuments()...waiting ${SLEEP_TIME / 1000} second(s) before retrying`);
                yield sleep(SLEEP_TIME);
                deadlineError = true;
            }
            else {
                throw e;
            }
        }
    } while (deadlineError || !allDocuments);
    return allDocuments;
});
exports.safelyGetDocumentReferences = safelyGetDocumentReferences;
