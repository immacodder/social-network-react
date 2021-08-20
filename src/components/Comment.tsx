import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Stack,
  Typography,
} from "@material-ui/core";
import { ThumbUp, ThumbDown, Reply } from "mdi-material-ui";
import React from "react";
import { CommentType } from "../types";

const p: CommentType = {
  authorUid: "test",
  bodyText: "This is a comment, yay",
  commentUid: "test",
  dislikedBy: [],
  likedBy: [],
  parentPostUid: "test",
};

export function Comment() {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="stretch">
      <Avatar sx={{ width: 48, height: 48 }}>TK</Avatar>
      <Paper
        sx={{ ml: 1, p: 2, pb: 1, width: "100%", borderRadius: "16px" }}
        elevation={4}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption">Tigran Khachaturian</Typography>
          <Typography variant="caption">07/07 at 5:00pm</Typography>
        </Box>
        <Typography variant="body1" sx={{ my: 1 }}>
          {p.bodyText}
        </Typography>
        <Divider />
        <Box display="flex" justifyContent="space-between">
          <Stack direction="row">
            <Stack direction="row" sx={{ alignItems: "center" }}>
              <Tooltip title="Like">
                <IconButton edge="start" sx={{ pl: "12px" }}>
                  <ThumbUp />
                </IconButton>
              </Tooltip>
              <Typography>{p.likedBy.length}</Typography>
            </Stack>
            <Stack direction="row" sx={{ alignItems: "center" }}>
              <Tooltip title="Dislike">
                <IconButton>
                  <ThumbDown />
                </IconButton>
              </Tooltip>
              <Typography>{p.dislikedBy.length}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Tooltip title="Reply">
              <IconButton>
                <Reply />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
