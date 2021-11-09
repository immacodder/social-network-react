import { Avatar } from "@mui/material"
import { GroupMessageRoom } from "../types"

export function MessangerGroupAvatar(p: GroupMessageRoom) {
	const memberArr = Object.keys(p.members)
	const name = memberArr
		.splice(memberArr.length <= 3 ? 2 : 1)
		.map((v) => v[0].toUpperCase())
		.join(",")

	return <Avatar src={p.photoUrl}>{name}</Avatar>
}
