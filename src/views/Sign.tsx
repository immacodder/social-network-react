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
import { Facebook, Google } from 'mdi-material-ui'
import { Formik, Form } from 'formik'
import { DatePicker } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'

interface Props {
  isSignIn: boolean
}

const formValues = {
  email: '',
  password: '',
  passwordRepeat: '',
  firstName: '',
  secondName: '',
  dateOfBirth: new Date(),
  profileImage: null as File | null,
}

export function Sign({ isSignIn }: Props) {
  const { push } = useHistory()

  const term = `Sign ${isSignIn ? 'in' : 'up'}`

  return (
    <Container sx={{ mt: 8 }}>
      <Formik
        initialValues={formValues}
        validationSchema={yup.object({
          email: yup.string().required().email('Invalid email address'),
          password: yup.string().required().min(8),
          passwordRepeat: yup.string().required().min(8),
          firstName: yup.string().required().min(2),
          secondName: yup.string().required().min(2),
        })}
        onSubmit={(values) => console.log(values)}
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
                          <Avatar sx={{ mr: 1 }} alt="Avatar">
                            TK
                          </Avatar>
                          <label htmlFor="imagePicker">
                            <Button component="span">
                              Pick a profile image
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="imagePicker"
                            />
                          </label>
                        </Box>
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
