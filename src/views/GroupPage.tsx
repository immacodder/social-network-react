import {
	collection,
	getFirestore,
	onSnapshot,
	query,
	where,
} from "@firebase/firestore"
import {
	Avatar,
	Box,
	Button,
	Card,
	Collapse,
	Icon,
	CardContent,
	Container,
	Stack,
	Typography,
} from "@mui/material"
import { format } from "date-fns"
import { doc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router"
import { Post } from "../components/Post"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { UserType, Group, PostType } from "../types"
import { Loader } from "./Loader"
import { MemberList } from "./MemberList"

const db = getFirestore(firebaseApp)

interface Props {
	groupId: string
}

export function GroupPage(p: Props) {
	const [group, setGroup] = useState<Group | null>(null)
	const [groupPosts, setGroupPosts] = useState<PostType[]>([])
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const [expanded, setExpanded] = useState(false)
	const { pathname } = useLocation()
	const { push } = useHistory()

	useEffect(() => {
		onSnapshot(doc(db, `groups/${p.groupId}`), (snapshot) => {
			setGroup(snapshot.data() as Group)
		})
	}, [p.groupId])

	useEffect(() => {
		const q = query(collection(db, "posts"), where("groupId", "==", p.groupId))
		onSnapshot(q, (snapshot) => {
			const results = snapshot.docs.map((post) => post.data() as PostType)
			setGroupPosts(results)
		})
	}, [p.groupId])

	if (!group) return <Loader />

	const currentUserInGroup = group.members.includes(currentUser.uid)

	if (pathname.includes("members"))
		return <MemberList members={group.members} />

	return (
		<>
			<Container>
				<Card elevation={8}>
					<CardContent sx={{ pt: 1 }}>
						<Stack sx={{ textAlign: "center", alignItems: "center" }} gap={1}>
							<Box sx={{ pb: "50px" }} position="relative">
								<Box
									component="div"
									style={{
										height: "250px",
										borderRadius: "0 0 10px 10px",
										backgroundImage: `url( ${group.coverImage} )`,
										backgroundSize: "cover",
										backgroundPosition: "center",
									}}
								/>
								<Avatar
									sx={{
										mx: "auto",
										height: "100px",
										width: "100px",
										position: "absolute",
										left: "calc( 50% - calc( 100px / 2) )",
										bottom: "15px",
										boxShadow: 4,
									}}
									src={group.profileImage || undefined}
								/>
							</Box>
							<Typography variant="h5">{group.title}</Typography>
							<Stack direction="row">
								<Button>
									{currentUserInGroup ? "Subscribe" : "Unsubscribe"}
								</Button>
								<Button
									onClick={() => navigator.clipboard.writeText(location.href)}
								>
									<Icon sx={{ mr: 1 }}>share</Icon>Share
								</Button>
							</Stack>
							<Button
								sx={{ pb: 0 }}
								onClick={() => setExpanded(!expanded)}
								color="secondary"
							>
								{expanded ? "Hide" : "Show"} about
							</Button>
							<Collapse in={expanded}>
								<Stack rowGap={1}>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Created at {format(group.createdAt, `MMMM do yyyy`)}
									</Typography>
									<Button
										onClick={() => push(pathname + "/members")}
										color="primary"
									>
										<Icon sx={{ mr: 1 }}>people</Icon>
										Members: {group.members.length}
									</Button>
									<Typography variant="subtitle1">Description</Typography>
									<Typography variant="body2">
										{group.description
											? group.description
											: "This group doens't have description"}
									</Typography>
								</Stack>
							</Collapse>
						</Stack>
					</CardContent>
				</Card>
			</Container>
			{groupPosts.length ? (
				groupPosts.map((post) => <Post key={post.uid} {...post} />)
			) : (
				<Box mt={4} display="flex" alignItems="center" justifyContent="center">
					<Typography>This group doesn't have any posts yet</Typography>
				</Box>
			)}
		</>
	)
}
