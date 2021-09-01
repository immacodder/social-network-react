import { Avatar } from '@material-ui/core'
import { SxProps, Theme } from '@material-ui/system'
import { Link } from 'react-router-dom'
import { useUserById } from '../hooks/useUserById'

interface Props {
	sx?: SxProps<Theme>
	uid: string
	redirect?: true
}

export function UserAvatar(p: Props) {
	const user = useUserById(p.uid)
	if (!user) return null
	const avatar = (
		<Avatar sx={p.sx} src={user.profileImage ?? undefined}>
			{`${user.firstName[0]}${user.secondName[0]}`}
		</Avatar>
	)

	if (p.redirect)
		return (
			<Link to={`/user/${p.uid}`} style={{ textDecoration: 'none' }}>
				{avatar}
			</Link>
		)
	else return avatar
}
