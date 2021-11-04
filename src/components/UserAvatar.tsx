import { Avatar } from "@mui/material"
import { SxProps, Theme } from "@mui/system"
import { Link } from "react-router-dom"
import { useUserById } from "../hooks/useUserById"
import { UserType } from "../types"

interface baseProps {
	redirect?: true
	sx?: SxProps<Theme>
}

function UserAvatar(p: { user: UserType } & baseProps) {
	const avatar = (
		<Avatar sx={p.sx} src={p.user.profileImage ?? undefined}>
			{`${p.user.firstName[0]}${p.user.secondName[0]}`}
		</Avatar>
	)

	if (p.redirect)
		return (
			<Link to={`/user/${p.user.uid}`} style={{ textDecoration: "none" }}>
				{avatar}
			</Link>
		)
	else return avatar
}
export function UserAvatarFetch(p: { uid: string } & baseProps) {
	const user = useUserById(p.uid)
	if (!user) return <Avatar sx={p.sx}></Avatar>

	return <UserAvatar user={user} {...p} />
}

export function UserAvatarRender(p: { user: UserType } & baseProps) {
	return <UserAvatar {...p} />
}
