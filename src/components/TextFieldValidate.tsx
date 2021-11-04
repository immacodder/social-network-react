import { TextField } from "@mui/material"
import { useField } from "formik"
import React from "react"

interface Props {
	name: string
	label: string
	type?: "password" | "text" | "email"
	variant?: "filled" | "outlined" | "standard"
	[key: string]: any
}

export function TextFieldValidate({ label, ...props }: Props) {
	const [field, meta] = useField(props.name)

	return (
		<TextField
			type={props?.type || "text"}
			error={!!(meta.touched && meta.error)}
			label={label}
			helperText={meta.touched ? meta.error : ""}
			{...field}
			{...props}
		/>
	)
}
