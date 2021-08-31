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
import { Formik, Form } from 'formik'
import { DatePicker } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import { useRef, useState } from 'react'
import { fire } from '..'
import { UserType } from '../types'
import { ImagePicker } from '../components/ImagePicker'
import { putProfileImageInStorage } from '../sharedFunctions'
interface Props {
	isSignIn: boolean
}
const formValues = {
	email: '',
	password: '',
	passwordRepeat: '',
	firstName: '',
	secondName: '',
	biography: '',
}

export function Sign({ isSignIn }: Props) {
	const { push } = useHistory()
	const inputRef = useRef<HTMLInputElement>(null)
	const term = `Sign ${isSignIn ? 'in' : 'up'}`
	const [date, setDate] = useState(new Date())

	async function onSignIn(v: typeof formValues) {
		fire.auth().signInWithEmailAndPassword(v.email, v.password)
		push('/')
	}

	async function onSignUp(v: typeof formValues) {
		const { user } = await fire
			.auth()
			.createUserWithEmailAndPassword(v.email, v.password)
		if (!user) throw new Error('there is no user')

		const userDetails: UserType = {
			biography: v.biography,
			dateOfBirth: date.getTime(),
			firstName: v.firstName,
			secondName: v.secondName,
			uid: user.uid,
			profileImage: null,
		}
		userDetails.profileImage = await putProfileImageInStorage(
			inputRef,
			user.uid,
		)
		await fire.firestore().doc(`users/${user.uid}`).set(userDetails)
		push('/')
	}

	return (
		<Container sx={{ mt: 8 }}>
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
				onSubmit={isSignIn ? onSignIn : onSignUp}
			>
				{(formik) => (
					<>
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
												<TextFieldValidate
													label="First Name"
													name="firstName"
												/>
												<TextFieldValidate
													label="Second Name"
													name="secondName"
												/>
												<DatePicker
													label="Pick a date"
													renderInput={(params) => <TextField {...params} />}
													value={date}
													onChange={(date) => setDate(date!)}
												/>
												<ImagePicker inputRef={inputRef} />
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
									<Button variant="outlined" fullWidth sx={{ mb: 2 }}>
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
										{term} instead
									</Button>
								</Stack>
							</Card>
						</Form>
					</>
				)}
			</Formik>
		</Container>
	)
}
