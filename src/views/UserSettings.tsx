import {
	CardHeader,
	Card,
	CardContent,
	Stack,
	TextField,
	Container,
	Button,
	CardActions,
	LinearProgress,
} from "@mui/material"
import { DatePicker } from "@mui/lab"
import { Form, Formik } from "formik"
import { useRef, useState } from "react"
import { ImagePickerAvatar } from "../components/ImagePickerAvatar"
import { TextFieldValidate } from "../components/TextFieldValidate"
import * as yup from "yup"
import { useAppSelector } from "../hooks"
import { UserType } from "../types"
import { putProfileImageInStorage } from "../sharedFunctions"
import { useHistory } from "react-router-dom"
import { firebaseApp } from "../firebase"
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore"
import { getStorage, ref, deleteObject } from "firebase/storage"

const storage = getStorage(firebaseApp)
const db = getFirestore(firebaseApp)

export function UserSettings() {
	const user = useAppSelector((s) => s.user.userState as UserType)
	const inputRef = useRef<HTMLInputElement>(null)
	const [date, setDate] = useState(new Date(user.dateOfBirth))
	const { push } = useHistory()
	const [progress, setProgress] = useState(false)
	const [isImageTouched, setIsImageTouched] = useState(false)

	const initialValues = {
		firstName: user.firstName,
		secondName: user.secondName,
		biography: user.biography,
	}

	async function onFormSubmit(v: typeof initialValues) {
		const userDetails: UserType = {
			biography: v.biography,
			dateOfBirth: date.getTime(),
			firstName: v.firstName,
			secondName: v.secondName,
			uid: user.uid,
			profileImage: user.profileImage,
			friendList: [],
		}

		setProgress(true)

		if (isImageTouched) {
			if (!inputRef.current!.files![0]) {
				if (user.profileImage) {
					const profileImageRef = ref(storage, user.profileImage)
					await deleteObject(profileImageRef)
					await updateDoc(doc(db, `users/${user.uid}`), { profileImage: null })
					userDetails.profileImage = null
				}
			} else {
				userDetails.profileImage = await putProfileImageInStorage(
					inputRef,
					user.uid
				)
			}
		}

		await setDoc(doc(db, `users/${user.uid}`), userDetails)
		setProgress(false)
		push("/user")
		location.reload()
	}

	return (
		<Container sx={{ mb: 8 }}>
			<Formik
				onSubmit={onFormSubmit}
				initialValues={initialValues}
				validationSchema={yup.object({
					firstName: yup.string().required().min(2),
					secondName: yup.string().required().min(2),
					biography: yup.string().notRequired().max(240),
				})}
			>
				{(formik) => (
					<Form>
						<Card elevation={8}>
							<CardHeader
								sx={{
									my: 2,
									textAlign: "center",
								}}
								title="User Settings"
							/>
							<CardContent sx={{ px: 4, pb: 2 }}>
								<Stack spacing={2}>
									<TextFieldValidate label="First Name" name="firstName" />
									<TextFieldValidate label="Second Name" name="secondName" />
									<DatePicker
										label="Pick a date"
										renderInput={(params) => <TextField {...params} />}
										value={date}
										onChange={(date) => setDate(date!)}
									/>
									<ImagePickerAvatar
										inputRef={inputRef}
										initialImage={user.profileImage ?? undefined}
										title={"Pick a profile image"}
										onChange={() => setIsImageTouched(true)}
									/>
									<TextFieldValidate
										name="biography"
										multiline
										label="Describe yourself (optional)"
										minRows={5}
									/>
								</Stack>
							</CardContent>
							<CardActions sx={{ px: 4 }}>
								<Button type="submit" color="primary">
									Submit
								</Button>
								<Button type="button" color="error">
									Cancel
								</Button>
							</CardActions>
							{progress && <LinearProgress />}
						</Card>
					</Form>
				)}
			</Formik>
		</Container>
	)
}
