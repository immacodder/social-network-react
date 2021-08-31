import {
	CardHeader,
	Card,
	CardContent,
	Stack,
	TextField,
	Container,
	Button,
	CardActions,
} from '@material-ui/core'
import { DatePicker } from '@material-ui/lab'
import { Form, Formik } from 'formik'
import { useRef, useState } from 'react'
import { ImagePicker } from '../components/ImagePicker'
import { TextFieldValidate } from '../components/TextFieldValidate'
import * as yup from 'yup'
import { useAppSelector } from '../hooks'
import { UserType } from '../types'
import { putProfileImageInStorage } from '../sharedFunctions'
import { fire } from '..'
import { useHistory } from 'react-router-dom'

export function UserSettings() {
	const user = useAppSelector((s) => s.user.userState as UserType)
	const inputRef = useRef<HTMLInputElement>(null)
	const [date, setDate] = useState(new Date(user.dateOfBirth))
	const { push } = useHistory()

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
			profileImage: null,
		}

		userDetails.profileImage = await putProfileImageInStorage(
			inputRef,
			user.uid,
		)

		await fire.firestore().doc(`users/${user.uid}`).set(userDetails)
		push('/user')
		location.reload()
	}

	return (
		<Container>
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
						<Card sx={{ px: 4, pb: 2 }} elevation={8}>
							<CardHeader
								sx={{
									my: 2,
									textAlign: 'center',
								}}
								title="User Settings"
							/>
							<CardContent>
								<Stack spacing={2}>
									<TextFieldValidate label="First Name" name="firstName" />
									<TextFieldValidate label="Second Name" name="secondName" />
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
								</Stack>
							</CardContent>
							<CardActions>
								<Button type="submit" color="primary">
									Submit
								</Button>
								<Button type="button" color="error">
									Cancel
								</Button>
							</CardActions>
						</Card>
					</Form>
				)}
			</Formik>
		</Container>
	)
}
