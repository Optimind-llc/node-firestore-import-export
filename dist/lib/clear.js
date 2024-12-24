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
const clearData = (startingRef_1, ...args_1) => __awaiter(void 0, [startingRef_1, ...args_1], void 0, function* (startingRef, logs = false) {
    if ((0, firestore_helpers_1.isLikeDocument)(startingRef)) {
        const promises = [clearCollections(startingRef, logs)];
        if (!(0, firestore_helpers_1.isRootOfDatabase)(startingRef)) {
            promises.push(startingRef.delete());
        }
        return Promise.all(promises);
    }
    else {
        return clearDocuments(startingRef, logs);
    }
});
const clearCollections = (startingRef_1, ...args_1) => __awaiter(void 0, [startingRef_1, ...args_1], void 0, function* (startingRef, logs = false) {
    const collectionPromises = [];
    const collectionsSnapshot = yield (0, firestore_helpers_1.safelyGetCollectionsSnapshot)(startingRef, logs);
    collectionsSnapshot.map((collectionRef) => {
        collectionPromises.push(clearDocuments(collectionRef, logs));
    });
    return (0, firestore_helpers_1.batchExecutor)(collectionPromises);
});
const clearDocuments = (collectionRef_1, ...args_1) => __awaiter(void 0, [collectionRef_1, ...args_1], void 0, function* (collectionRef, logs = false) {
    logs && console.log(`Retrieving documents from ${collectionRef.path}`);
    const allDocuments = yield (0, firestore_helpers_1.safelyGetDocumentReferences)(collectionRef, logs);
    const documentPromises = [];
    allDocuments.forEach((docRef) => {
        documentPromises.push(clearCollections(docRef, logs));
        documentPromises.push(docRef.delete());
    });
    return (0, firestore_helpers_1.batchExecutor)(documentPromises);
});
exports.default = clearData;
