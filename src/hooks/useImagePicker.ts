import { readAsDataURL } from "promise-file-reader"
import { useState, RefObject } from "react"

interface useImagePickerProps {
	initialImage?: string
	inputRef: RefObject<HTMLInputElement>
	onChange?: (image: string | null) => void
}

export function useImagePicker(p: useImagePickerProps) {
	const [imagePreview, setImagePreview] = useState<null | string>(
		p.initialImage ?? null
	)

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

	return {
		imagePreview,
		onClearClick,
		inputRef: p.inputRef,
		onFileInputChange,
	}
}
