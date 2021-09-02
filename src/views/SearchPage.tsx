import { Container, TextField } from '@material-ui/core'
import { Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'

export function SearchPage() {
	// const posts = useState()
	const [term, setTerm] = useState('')

	return (
		<Container>
			<TextField
				label="Search for anything"
				fullWidth
				InputProps={{ fullWidth: true }}
				autoFocus
				value={term}
				onChange={(e) => setTerm(e.target.value)}
			/>
		</Container>
	)
}
