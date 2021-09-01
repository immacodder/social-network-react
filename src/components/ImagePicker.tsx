import { Avatar, Button, Box, Stack } from '@material-ui/core'
import { Account } from 'mdi-material-ui'
import React, { useState } from 'react'
import { readAsDataURL } from 'promise-file-reader'

interface Props {
	src?: string
	inputRef: React.RefObject<HTMLInputElement>
	onChange?: (image: string | null) => void
}

export function ImagePicker(p: Props) {
	const [imagePreview, setImagePreview] = useState<null | string>(null)

	async function onFileInputChange() {
		if (!p.inputRef.current || !p.inputRef.current.files)
			return console.error('No image')
		if (!p.inputRef.current.files[0]) {
			setImagePreview('')
		} else {
			const image = p.inputRef.current.files[0]
			const imageString = await readAsDataURL(image)
			setImagePreview(imageString)
		}
		p.onChange && p.onChange(imagePreview)
	}

	function onClearClick(e: any) {
		e.preventDefault()
		p.inputRef.current!.value = ''
		onFileInputChange()
	}

	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Avatar
				src={imagePreview ?? p.src}
				sx={{ mr: 1, width: 100, height: 100 }}
				alt="Avatar"
			>
				<Account sx={{ height: 80, width: 80 }} />
			</Avatar>
			<label htmlFor="imagePicker">
				<Stack>
					<Button component="span">Pick a profile image</Button>
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
					style={{ display: 'none' }}
					id="imagePicker"
				/>
			</label>
		</Box>
	)
}
