import browserImageCompression from 'browser-image-compression'
import {
  Avatar,
  Box,
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
import { Account, Facebook, Google } from 'mdi-material-ui'
import { Formik, Form } from 'formik'
import { DatePicker } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import React, { useRef, useState } from 'react'
import { fire } from '..'
import { UserType } from '../types'
import { readAsDataURL } from 'promise-file-reader'

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
  dateOfBirth: new Date(),
  profileImage: null as File | null,
}

export function Sign({ isSignIn }: Props) {
  const { push } = useHistory()
  const fileInput = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  )

  const term = `Sign ${isSignIn ? 'in' : 'up'}`

  async function onSignIn(v: typeof formValues) {
    fire.auth().signInWithEmailAndPassword(v.email, v.password)
  }

  /*
    1: sign up the user
    2: get the user uid
    3: using form values add a firestore entry with doc('user${user.uid}')
    4: when it is done, redirect user to the home page
  */

  async function onFileInputChange() {
    if (!fileInput.current || !fileInput.current.files)
      return console.error('No image')
    const image = fileInput.current.files[0]
    const imageString = await readAsDataURL(image)
    setImagePreview(imageString)
  }

  async function onSignUp(v: typeof formValues) {
    const { user } = await fire
      .auth()
      .createUserWithEmailAndPassword(v.email, v.password)
    if (!user) throw new Error('there is no user')

    const storage = fire.storage()

    const compressImage = async function () {
      if (!v.profileImage) return null
      if (v.profileImage.size * 1024 < 500) return v.profileImage
      return await browserImageCompression(v.profileImage, {
        maxSizeMB: 0.5,
        maxIteration: 20,
      })
    }

    const putImageInStorage = async function () {
      const compressedImage = await compressImage()
      if (!compressedImage) return null

      const ref = storage.ref(
        `profileImages/${user?.uid}.${compressedImage.name.split('.').pop()}`,
      )
      await ref.put(compressedImage)

      const url = (await ref.getDownloadURL()) as string
      return url
    }

    const userDetails: UserType = {
      biography: v.biography,
      dateOfBirth: v.dateOfBirth.getTime(),
      firstName: v.firstName,
      secondName: v.secondName,
      uid: user.uid,
      profileImage: null,
    }

    userDetails.profileImage = await putImageInStorage()

    fire.firestore().doc(`users/${user.uid}`).set(userDetails)
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
                          value={formik.values.dateOfBirth}
                          onChange={() => formik.handleChange('dateOfBirth')}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={imagePreview}
                            sx={{ mr: 1, width: 100, height: 100 }}
                            alt="Avatar"
                          >
                            <Account sx={{ height: 80, width: 80 }} />
                          </Avatar>
                          <label htmlFor="imagePicker">
                            <Button component="span">
                              Pick a profile image
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInput}
                              onChange={onFileInputChange}
                              style={{ display: 'none' }}
                              id="imagePicker"
                            />
                          </label>
                        </Box>
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
