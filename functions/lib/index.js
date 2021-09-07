"use strict";
exports.__esModule = true;
exports.deleteUserOnMeili = exports.updateUserOnMeili = exports.uploadUserToMeili = exports.deletePostOnMeili = exports.updatePostOnMeili = exports.updloadPostToMeili = void 0;
var functions = require("firebase-functions");
var meilisearch_1 = require("meilisearch");
var client = new meilisearch_1.MeiliSearch({ host: 'http://localhost:7700' });
// posts
exports.updloadPostToMeili = functions.firestore
    .document('posts/{postId}')
    .onCreate(function (snap) {
    client.index('posts').addDocuments([snap.data()]);
    return 0;
});
exports.updatePostOnMeili = functions.firestore
    .document('posts/{postId}')
    .onUpdate(function (snap) {
    client.index('posts').updateDocuments([snap.after.data()]);
    return 0;
});
exports.deletePostOnMeili = functions.firestore
    .document('posts/{postId}')
    .onDelete(function (snap) {
    client.index('posts').deleteDocument(snap.id);
    return 0;
});
// users
exports.uploadUserToMeili = functions.firestore
    .document('users/{userId}')
    .onCreate(function (snap) {
    client.index('users').addDocuments([snap.data()]);
    return 0;
});
exports.updateUserOnMeili = functions.firestore
    .document('users/{userId}')
    .onUpdate(function (snap) {
    client.index('users').updateDocuments([snap.after.data()]);
    return 0;
});
exports.deleteUserOnMeili = functions.firestore
    .document('users/{userId}')
    .onDelete(function (snap) {
    client.index('users').deleteDocument(snap.id);
    return 0;
});
//# sourceMappingURL=index.js.map