"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_helpers_1 = require("./firestore-helpers");
const helpers_1 = require("./helpers");
const exportData = (startingRef_1, ...args_1) => __awaiter(void 0, [startingRef_1, ...args_1], void 0, function* (startingRef, logs = false) {
    if ((0, firestore_helpers_1.isLikeDocument)(startingRef)) {
        const collectionsPromise = getCollections(startingRef, logs);
        let dataPromise;
        if ((0, firestore_helpers_1.isRootOfDatabase)(startingRef)) {
            dataPromise = Promise.resolve({});
        }
        else {
            dataPromise = startingRef.get()
                .then(snapshot => snapshot.data())
                .then(data => (0, helpers_1.serializeSpecialTypes)(data));
        }
        return yield (0, firestore_helpers_1.batchExecutor)([collectionsPromise, dataPromise]).then(res => {
            return Object.assign({ '__collections__': res[0] }, res[1]);
        });
    }
    else {
        return yield getDocuments(startingRef, logs);
    }
});
const getCollections = (startingRef_1, ...args_1) => __awaiter(void 0, [startingRef_1, ...args_1], void 0, function* (startingRef, logs = false) {
    const collectionNames = [];
    const collectionPromises = [];
    const collectionsSnapshot = yield (0, firestore_helpers_1.safelyGetCollectionsSnapshot)(startingRef, logs);
    collectionsSnapshot.map((collectionRef) => {
        collectionNames.push(collectionRef.id);
        collectionPromises.push(getDocuments(collectionRef, logs));
    });
    const results = yield (0, firestore_helpers_1.batchExecutor)(collectionPromises);
    const zipped = {};
    results.map((res, idx) => {
        zipped[collectionNames[idx]] = res;
    });
    return zipped;
});
const getDocuments = (collectionRef_1, ...args_1) => __awaiter(void 0, [collectionRef_1, ...args_1], void 0, function* (collectionRef, logs = false) {
    logs && console.log(`Retrieving documents from ${collectionRef.path}`);
    const results = {};
    const documentPromises = [];
    const allDocuments = yield (0, firestore_helpers_1.safelyGetDocumentReferences)(collectionRef, logs);
    allDocuments.forEach((doc) => {
        documentPromises.push(new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            const docSnapshot = yield doc.get();
            const docDetails = {};
            if (docSnapshot.exists) {
                docDetails[docSnapshot.id] = (0, helpers_1.serializeSpecialTypes)(docSnapshot.data());
            }
            else {
                docDetails[docSnapshot.id] = {};
            }
            docDetails[docSnapshot.id]['__collections__'] = yield getCollections(docSnapshot.ref, logs);
            resolve(docDetails);
        })));
    });
    (yield (0, firestore_helpers_1.batchExecutor)(documentPromises))
        .forEach((res) => {
        Object.keys(res).map(key => results[key] = res[key]);
    });
    return results;
});
exports.default = exportData;
