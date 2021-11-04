import { Paper, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { formatRelative } from "date-fns"
import { useUserById } from "../hooks/useUserById"
import { MessageType } from "../types"
import { UserAvatarRender } from "./UserAvatar"

interface Props {
	type: "sended" | "received"
	messageRoomType: "group" | "dialog"
	message: MessageType
}

export function Message(p: Props) {
	const user = useUserById(p.message.createdBy)
	if (!user) return null

	const formattedTime = formatRelative(
		p.message.createdAt,
		new Date().getTime(),
		{
			weekStartsOn: 1,
		}
	)

	if (p.messageRoomType === "dialog") {
		return (
			<Paper
				sx={{
					p: 1,
					backgroundColor: p.type === "sended" ? "secondary.main" : undefined,
					color: p.type === "sended" ? "#eee" : undefined,
					width: "fit-content",
					display: "flex",
					alignItems: "center",
				}}
			>
				{p.message.text}
				<Box width={18} />
				<Typography
					variant="caption"
					color={p.type === "sended" ? "#eee" : "text.secondary"}
				>
					{formattedTime}
				</Typography>
			</Paper>
		)
	} else {
		return (
			<Stack direction="row" gap={1}>
				{p.type === "received" && <UserAvatarRender user={user} redirect />}
				<Stack>
					<Typography variant="caption">
						{`${
							p.type === "received"
								? `${user.firstName} ${user.secondName}`
								: "You"
						} ${formattedTime}`}
					</Typography>
					<Paper
						sx={{
							p: 1,
							backgroundColor:
								p.type === "sended" ? "secondary.main" : undefined,
							color: p.type === "sended" ? "#eee" : undefined,
							width: "fit-content",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{p.message.text}
					</Paper>
				</Stack>
			</Stack>
		)
	}
}
