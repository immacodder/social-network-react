import { Avatar, Button, Box, Stack, Icon } from "@mui/material"
import { RefObject } from "react"
import { v4 } from "uuid"
import { useImagePicker } from "../hooks/useImagePicker"

interface Props {
	initialImage?: string
	inputRef: RefObject<HTMLInputElement>
	onChange?: (image: string | null) => void
	title: string
	widthAndHeight?: number
}

export function ImagePickerAvatar(p: Props) {
	const { imagePreview, inputRef, onClearClick, onFileInputChange } =
		useImagePicker({
			inputRef: p.inputRef,
			initialImage: p.initialImage,
		})

	const imagePickerId = `imagePicker/${v4()}`

	return (
		<Box sx={{ display: "flex", alignItems: "center" }}>
			<Avatar
				src={imagePreview ?? p.initialImage}
				sx={{
					mr: 1,
					width: p.widthAndHeight ?? 100,
					height: p.widthAndHeight ?? 100,
				}}
				alt="Avatar"
			>
				<Icon sx={{ fontSize: `${(p.widthAndHeight ?? 100) - 20}px` }}>
					account_circle
				</Icon>
			</Avatar>
			<label htmlFor={imagePickerId}>
				<Stack sx={{ alignItems: "start" }}>
					<Button component="span">{p.title}</Button>
					<Button
						component="span"
						onClick={(e: any) => onClearClick(e)}
						color="error"
					>
						Clear
					</Button>
				</Stack>
				<input
					type="file"
					accept="image/*"
					ref={inputRef}
					onChange={onFileInputChange}
					style={{ display: "none" }}
					id={imagePickerId}
				/>
			</label>
		</Box>
	)
}
