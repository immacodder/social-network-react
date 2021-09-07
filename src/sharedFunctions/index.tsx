import browserImageCompression from 'browser-image-compression'
import React from 'react'
import { firebaseApp } from '../firebase'
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'

const storage = getStorage(firebaseApp)

type inputRef = React.RefObject<HTMLInputElement>

export const compressImage = async function (
	inputRef: inputRef,
	maxSizeMB = 0.5,
	maxSizeUncompressedKB = 500,
) {
	if (
		!inputRef.current ||
		!inputRef.current.files ||
		!inputRef.current.files[0]
	)
		return null
	if (inputRef.current.files[0].size * 1024 < maxSizeUncompressedKB)
		return inputRef.current.files[0]
	return await browserImageCompression(inputRef.current.files[0], {
		maxSizeMB,
		maxIteration: 20,
	})
}

export const putProfileImageInStorage = async function (
	inputRef: inputRef,
	userUid: string,
) {
	const compressedImage = await compressImage(inputRef)
	if (!compressedImage) return null

	const profileImageRef = ref(
		storage,
		`profileImages/${userUid}.${compressedImage.name.split('.').pop()}`,
	)
	await uploadBytes(profileImageRef, compressedImage)

	const url = (await getDownloadURL(profileImageRef)) as string
	return url
}
