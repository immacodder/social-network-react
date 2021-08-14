import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  ImageList,
  ImageListItem,
  Stack,
  TextField,
} from '@material-ui/core'
import { useEffect, useRef, useState } from 'react'
import { readAsDataURL } from 'promise-file-reader'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

interface postValues {
  postTitle: string
  postBody: string
  postImages: null | FileList
}

const initialValues: postValues = {
  postTitle: '',
  postBody: '',
  postImages: null,
}

export function Home() {
  const [images, setImages] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function onInputChange() {
    const fileList = Array.from(inputRef?.current?.files as FileList)
    const listOfPromises = [] as Promise<string>[]

    fileList.forEach((v, i) => {
      listOfPromises.push(readAsDataURL(v))
    })

    setImages(await Promise.all(listOfPromises))
  }

  return (
    <Container>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object({
          postTitle: Yup.string().required().max(80),
          postBody: Yup.string().required().min(20).max(700),
        })}
        onSubmit={() => undefined}
      >
        <Form>
          <Card elevation={8}>
            <CardContent sx={{pb:0}}>
              <Stack gap={2}>
                <TextField variant="outlined" fullWidth label="Post Title" />
                <TextField
                  multiline
                  minRows={5}
                  variant="outlined"
                  label="Add post"
                  fullWidth
                />
              </Stack>

              <ImageList
                cols={2}
                gap={4}
                sx={{ width: '100%', maxHeight: 300 }}
                rowHeight={200}
              >
                {images.map((v, i) => (
                  <ImageListItem key={i}>
                    <img
                      style={{
                        backgroundImage: `url(${v})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                      }}
                    ></img>
                  </ImageListItem>
                ))}
              </ImageList>
              {!!images.length && <Divider />}
            </CardContent>
            <CardActions>
              <label htmlFor="imagePicker">
                <Button component="span">Pick Images</Button>
                <input
                  ref={inputRef}
                  onChange={onInputChange}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="imagePicker"
                />
              </label>
            </CardActions>
          </Card>
        </Form>
      </Formik>
    </Container>
  )
}
