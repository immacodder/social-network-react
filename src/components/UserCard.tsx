import { Avatar, CardHeader, Stack, Typography } from "@mui/material"
import { Card, Container } from "@mui/material"
import { useUserById } from "../hooks/useUserById"
import { UserType } from "../types"
import { UserAvatarFetch } from "./UserAvatar"

export function UserCard(p: UserType) {
	return (
		<Card>
			<CardHeader
				avatar={
					<UserAvatarFetch
						uid={p.uid}
						sx={{ width: 75, height: 75 }}
						redirect
					/>
				}
				title={<Typography>{p.firstName + " " + p.secondName}</Typography>}
				subheader={p.biography ?? <Typography>{p.biography}</Typography>}
			/>
		</Card>
	)
}
