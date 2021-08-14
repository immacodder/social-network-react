import {
  FilledInputProps,
  InputProps,
  OutlinedInputProps,
  TextField,
} from '@material-ui/core'
import { useField } from 'formik'

interface Props {
  name: string
  label: string
  type?: 'password' | 'text' | 'email'
  [key: string]: any
}

export function TextFieldValidate({ label, ...props }: Props) {
  const [field, meta] = useField(props.name)

  return (
    <TextField
      type={props?.type || 'text'}
      error={!!(meta.touched && meta.error)}
      label={label}
      helperText={meta.touched ? meta.error : ''}
      {...field}
      {...props}
    />
  )
}
