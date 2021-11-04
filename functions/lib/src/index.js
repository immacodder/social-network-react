"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNotificationDuplicate = exports.deleteUserOnMeili = exports.updateUserOnMeili = exports.uploadUserToMeili = exports.deletePostOnMeili = exports.updatePostOnMeili = exports.updloadPostToMeili = void 0;
const functions = require("firebase-functions");
const meilisearch_1 = require("meilisearch");
const admin = require("firebase-admin");
const date_fns_1 = require("date-fns");
const client = new meilisearch_1.MeiliSearch({ host: "http://localhost:7700" });
admin.initializeApp();
// posts
exports.updloadPostToMeili = functions.firestore
    .document("posts/{postId}")
    .onCreate(async (snap) => {
    const data = snap.data();
    const user = (await admin.firestore().doc(`users/${data.authorUid}`).get()).data();
    const post = {
        uid: data.uid,
        title: data.title,
        authorName: `${user.firstName} ${user.secondName}`,
        createdAt: date_fns_1.format(data.createdAt, "Yo MMMM Mo eeee", { weekStartsOn: 1 }),
        bodyText: data.bodyText,
    };
    client.index("posts").addDocuments([post]);
    return 0;
});
exports.updatePostOnMeili = functions.firestore
    .document("posts/{postId}")
    .onUpdate((snap) => {
    const data = snap.after.data();
    const updatedPost = {
        uid: data.uid,
        title: data.title,
        bodyText: data.bodyText,
    };
    client.index("posts").updateDocuments([updatedPost]);
    return 0;
});
exports.deletePostOnMeili = functions.firestore
    .document("posts/{postId}")
    .onDelete((snap) => {
    client.index("posts").deleteDocument(snap.id);
    return 0;
});
// users
exports.uploadUserToMeili = functions.firestore
    .document("users/{userId}")
    .onCreate((snap) => {
    client.index("users").addDocuments([snap.data()]);
    return 0;
});
exports.updateUserOnMeili = functions.firestore
    .document("users/{userId}")
    .onUpdate((snap) => {
    client.index("users").updateDocuments([snap.after.data()]);
    return 0;
});
exports.deleteUserOnMeili = functions.firestore
    .document("users/{userId}")
    .onDelete((snap) => {
    client.index("users").deleteDocument(snap.id);
    return 0;
});
exports.checkNotificationDuplicate = functions.firestore
    .document("notifications/{notificationId}")
    .onCreate(async (snap, context) => {
    // maybe comment this line out afterwards
    const db = admin.firestore();
    const data = snap.data();
    if (data.type !== "friendRequest")
        return 0;
    const result = (await db
        .collection("notifications")
        .where("type", "==", data.type)
        .where("sender", "==", data.sender)
        .where("receiver", "==", data.receiver)
        .get()).docs.map((snap) => snap.data());
    if (result.length && result[0].uid !== data.uid) {
        console.log("Detected a duplicate, deleting...");
        snap.ref.delete();
    }
    return 0;
});
//# sourceMappingURL=index.js.map