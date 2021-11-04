import { Avatar, Button, Box, Stack, Icon } from "@mui/material"
import React, { useState } from "react"
import { readAsDataURL } from "promise-file-reader"

interface Props {
	src?: string
	inputRef: React.RefObject<HTMLInputElement>
	onChange?: (image: string | null) => void
	title: string
	widthAndHeight?: number
}

// Todo
// Make sure that src is not only used in preview, but also affects the submitting
export function ImagePicker(p: Props) {
	const [imagePreview, setImagePreview] = useState<null | string>(p.src ?? null)

	async function onFileInputChange() {
		if (!p.inputRef.current || !p.inputRef.current.files)
			return console.error("No image")
		if (!p.inputRef.current.files[0]) {
			setImagePreview("")
			p.onChange && p.onChange(null)
			return
		}
		const image = p.inputRef.current.files[0]
		const imageString = await readAsDataURL(image)
		setImagePreview(imageString)
		p.onChange && p.onChange(imageString)
	}

	function onClearClick(e: any) {
		e.preventDefault()
		p.inputRef.current!.value = ""
		onFileInputChange()
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center" }}>
			<Avatar
				src={imagePreview ?? p.src}
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
			<label htmlFor="imagePicker">
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
					ref={p.inputRef}
					onChange={onFileInputChange}
					style={{ display: "none" }}
					id="imagePicker"
				/>
			</label>
		</Box>
	)
}
