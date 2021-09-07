import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Container,
	Divider,
	Stack,
	TextField,
} from '@material-ui/core'
import { TextFieldValidate } from '../components/TextFieldValidate'
import * as yup from 'yup'
import { Facebook, Google } from 'mdi-material-ui'
import { Formik, Form, useFormikContext } from 'formik'
import { DatePicker } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react'
import { UserType } from '../types'
import { ImagePicker } from '../components/ImagePicker'
import { putProfileImageInStorage } from '../sharedFunctions'
import { firebaseApp } from '../firebase'
import {
	getAuth,
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	onAuthStateChanged,
	GoogleAuthProvider,
} from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

const formValues = {
	email: '',
	password: '',
	passwordRepeat: '',
	firstName: '',
	secondName: '',
	biography: '',
}
interface Props {
	isSignIn: boolean
}

type inputRef = React.RefObject<HTMLInputElement>
type push = (path: string, state?: unknown) => void

export function SignWrapper({ isSignIn }: Props) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [date, setDate] = useState(new Date())
	const { push } = useHistory()
	const [userFromProvider, setUserFromProvider] = useState<null | User>(null)
	return (
		<Formik
			initialValues={formValues}
			validationSchema={yup.object({
				email: yup.string().required().email('Invalid email address'),
				password: yup.string().required().min(8),
				...(!isSignIn && {
					passwordRepeat: yup.string().required().min(8),
					firstName: yup.string().required().min(2),
					secondName: yup.string().required().min(2),
					biography: yup.string().notRequired().max(240),
				}),
			})}
			onSubmit={(v) =>
				isSignIn
					? onSignIn(v, push)
					: onSignUp(v, inputRef, push, date, userFromProvider ?? undefined)
			}
		>
			<Sign
				isSignIn={isSignIn}
				inputRef={inputRef}
				date={date}
				setDate={(date) => setDate(date)}
				userFromProvider={userFromProvider}
				setUserFromProvider={setUserFromProvider}
			/>
		</Formik>
	)
}

async function onSignUp(
	v: typeof formValues,
	inputRef: inputRef,
	push: push,
	date: Date,
	userFromProvider?: User,
) {
	let user: User
	if (!userFromProvider) {
		user = (await createUserWithEmailAndPassword(auth, v.email, v.password))
			.user as User
	} else user = userFromProvider

	const userDetails: UserType = {
		biography: v.biography,
		dateOfBirth: date.getTime(),
		firstName: v.firstName,
		secondName: v.secondName,
		uid: user.uid,
		profileImage: null,
	}
	if (userFromProvider?.photoURL && !inputRef.current?.files![0]) {
		userDetails.profileImage = userFromProvider.photoURL
	} else {
		userDetails.profileImage = await putProfileImageInStorage(
			inputRef,
			user.uid,
		)
	}
	await setDoc(doc(db, `users/${user.uid}`), userDetails)
	push('/')
	location.reload()
}

async function onSignIn(v: typeof formValues, push: push) {
	signInWithEmailAndPassword(auth, v.email, v.password)
	push('/')
}

interface SignProps {
	inputRef: inputRef
	date: Date
	setDate(date: Date): void
	isSignIn: boolean
	userFromProvider: User | null
	setUserFromProvider(user: User): void
}

function Sign({
	inputRef,
	date,
	setDate,
	isSignIn,
	setUserFromProvider,
	userFromProvider,
}: SignProps) {
	const { push } = useHistory()
	const term = `Sign ${isSignIn ? 'in' : 'up'}`
	const { setFieldValue } = useFormikContext()

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (!user) return null
			const userName = user.displayName?.split(' ')
			setUserFromProvider(user as User)
			setFieldValue('email', user.email)
			userName && setFieldValue('firstName', userName[0])
			userName && setFieldValue('secondName', userName[1])
		})
		return unsub
	}, [setFieldValue, inputRef, setUserFromProvider])

	async function onSignWithGoogleClick() {
		const googleProvider = new GoogleAuthProvider()
		try {
			await signInWithPopup(auth, googleProvider)
			push('/signup')
		} catch (e) {
			console.error(e)
			push('/signup')
			location.reload()
		}
	}
	return (
		<Container sx={{ mt: 8 }}>
			<Form>
				<Card sx={{ px: 4, pb: 2 }} elevation={8}>
					<CardHeader
						sx={{
							my: 2,
							textAlign: 'center',
						}}
						title={term}
					/>
					<CardContent>
						<Stack spacing={2}>
							{!isSignIn ? (
								<>
									<TextFieldValidate label="Email Address" name="email" />
									<TextFieldValidate label="First Name" name="firstName" />
									<TextFieldValidate label="Second Name" name="secondName" />
									<DatePicker
										label="Pick a date"
										renderInput={(params) => <TextField {...params} />}
										value={date}
										onChange={(date) => setDate(date!)}
									/>
									<ImagePicker
										src={userFromProvider?.photoURL ?? undefined}
										inputRef={inputRef}
									/>
									<TextFieldValidate
										name="biography"
										multiline
										label="Describe yourself (optional)"
										minRows={5}
									/>
									<TextFieldValidate
										label="Password"
										name="password"
										type="password"
									/>
									<TextFieldValidate
										type="password"
										label="Repeat Password"
										name="passwordRepeat"
									/>
								</>
							) : (
								<>
									<TextFieldValidate label="Email Address" name="email" />
									<TextFieldValidate
										label="Password"
										type="password"
										name="password"
									/>
								</>
							)}
						</Stack>
					</CardContent>
					<Stack sx={{ px: 2, pb: 2 }}>
						<Button type="submit" fullWidth variant="contained">
							Submit
						</Button>
						<Divider sx={{ my: 2 }} />
						<Button
							onClick={onSignWithGoogleClick}
							variant="outlined"
							fullWidth
							sx={{ mb: 2 }}
						>
							{term} with Google <Google sx={{ ml: 1 }} />
						</Button>
						<Button variant="outlined" fullWidth sx={{ mb: 2 }}>
							{term} with Facebook
							<Facebook sx={{ ml: 1 }} />
						</Button>
						<Button
							variant="text"
							color="secondary"
							onClick={() => push(`sign${!isSignIn ? 'in' : 'up'}`)}
						>
							{!isSignIn ? 'Sign In' : 'Sign Up'} instead
						</Button>
					</Stack>
				</Card>
			</Form>
		</Container>
	)
}
