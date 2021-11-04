import {
	getDocs,
	query,
	collection,
	where,
	getFirestore,
} from "firebase/firestore"
import { firebaseApp } from "./firebase"
const db = getFirestore(firebaseApp)

// const result = getDocs(
// 	query(collection(db, "messanger"), where("type", "==", "dialog"))
// ).then((res) => console.log(res.docs))

// console.log(result)
