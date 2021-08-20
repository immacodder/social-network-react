import * as Yup from 'yup'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Formik } from 'formik'
import {
  ThumbDown,
  ThumbUp,
  Comment as CommentIcon,
  Share,
} from 'mdi-material-ui'
import { PostType } from '../types'
import { Comment } from './Comment'
import { TextFieldValidate } from './TextFieldValidate'
import React, { useState } from 'react'

const p: PostType = {
  authorUid: 'test',
  title: 'A title',
  bodyText:
    "Lorem ipsum hello world I love this thing and I don't know what the heck am I doing",
  comments: [],
  createdAt: new Date().getTime(),
  dislikedBy: [],
  likedBy: [],
  imageUrls: [
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bmF0dXJlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  ],
  postUid: 'test',
}

export function Post() {
  const [isCommenting, setIsCommenting] = useState(false)
  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Card elevation={4}>
        <CardHeader
          title={<Typography variant="subtitle1">{p.title}</Typography>}
          subheader="Tigran Khachaturian"
          avatar={<Avatar sx={{ width: 48, height: 48 }}>TK</Avatar>}
        />
        <CardContent>
          <Typography>{p.bodyText}</Typography>
        </CardContent>
        {!!p.imageUrls.length && (
          <ImageList
            variant={p.imageUrls.length > 4 ? 'masonry' : 'standard'}
            cols={p.imageUrls.length === 1 ? 1 : 2}
            gap={4}
          >
            {p.imageUrls.map((v) => (
              <ImageListItem key={v}>
                <img src={v} />
              </ImageListItem>
            ))}
          </ImageList>
        )}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Stack direction="row">
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Tooltip title="Like">
                <IconButton>
                  <ThumbUp />
                </IconButton>
              </Tooltip>
              <Typography>{p.likedBy.length}</Typography>
            </Stack>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Tooltip title="Dislike">
                <IconButton>
                  <ThumbDown />
                </IconButton>
              </Tooltip>
              <Typography>{p.likedBy.length}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Tooltip title="Share">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Comment">
              <IconButton onClick={() => setIsCommenting(true)}>
                <CommentIcon color={isCommenting ? 'primary' : undefined} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Card>
      <Box pt={2}>
        <Formik
          initialValues={{ commentBody: '' }}
          validationSchema={Yup.object({
            commentBody: Yup.string().required().max(320),
          })}
          onSubmit={() => undefined}
        >
          <>
            <Comment />
            {isCommenting && (
              <Card elevation={4} sx={{ mt: 4 }}>
                <CardHeader
                  sx={{ textAlign: 'left', pl: 2 }}
                  title={<Typography variant="h6">Add comment</Typography>}
                />
                <CardContent>
                  <TextFieldValidate
                    label="What is it about?"
                    autoFocus
                    name="commentBody"
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </CardContent>
                <CardActions>
                  <Button type="submit">Submit</Button>
                  <Button type="button" color="error">
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            )}
          </>
        </Formik>
      </Box>
    </Container>
  )
}
