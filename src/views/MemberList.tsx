import { doc, getDoc, getFirestore, onSnapshot } from "@firebase/firestore"
import {
	Card,
	CardContent,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router"
import { UserAvatarRender } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { UserType } from "../types"
import { Loader } from "./Loader"

interface P {
	members: string[]
}

const db = getFirestore(firebaseApp)

export function MemberList(p: P) {
	const [members, setMembers] = useState<UserType[]>([])
	const { push } = useHistory()

	useEffect(() => {
		const resolve = p.members.map((member) =>
			getDoc(doc(db, `users/${member}`))
		)
		Promise.all(resolve).then((members) =>
			setMembers(members.map((member) => member.data() as UserType))
		)
	}, [p.members])

	if (!members.length) return <Loader />

	return (
		<Card>
			<CardContent>
				<Typography sx={{ ml: 2 }} variant="h5">
					Member list
				</Typography>
				<List>
					{members.map((member) => {
						return (
							<ListItemButton
								onClick={() => push(`/user/${member.uid}`)}
								key={member.uid}
							>
								<ListItemAvatar>
									<UserAvatarRender redirect user={member} />
								</ListItemAvatar>
								<ListItemText>
									{member.firstName + " " + member.secondName}
								</ListItemText>
							</ListItemButton>
						)
					})}
				</List>
			</CardContent>
		</Card>
	)
}
