import {
	AppBar,
	Link,
	IconButton,
	Menu,
	Toolbar,
	Stack,
	Avatar,
	MenuItem,
	ListItemIcon,
} from '@material-ui/core'
import { AccountBox, Cog, Logout, Magnify } from 'mdi-material-ui'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import React, { useRef, useState } from 'react'
import { fire } from '..'
import { useAppSelector } from '../hooks'
import { UserType } from '../types'

export function AppBarComponent() {
	const [opened, setOpened] = useState(false)
	const { push } = useHistory()
	const anchorEl = useRef<HTMLDivElement>(null)
	const user = useAppSelector((s) => s.user.userState as UserType)

	function onSignOutClick() {
		fire.auth().signOut()
	}

	return (
		<>
			<AppBar position="static" sx={{ mb: 2 }}>
				<Toolbar
					sx={{
						justifyContent: 'space-between',
					}}
				>
					<Link
						sx={{ color: 'white' }}
						fontWeight="bold"
						underline="none"
						variant="h5"
						component={RouterLink}
						to="/"
					>
						Socify
					</Link>

					<Stack direction="row" gap={2}>
						<IconButton onClick={() => push('/searchpage')}>
							<Magnify sx={{ color: 'white' }} />
						</IconButton>
						<Avatar
							className="button"
							src={user.profileImage ?? undefined}
							onClick={() => setOpened(true)}
							ref={anchorEl}
						>
							{`${user.firstName[0]}${user.secondName[0]}`}
						</Avatar>
						<Menu
							anchorEl={anchorEl.current!}
							open={opened}
							onClose={() => setOpened(false)}
						>
							<MenuItem onClick={() => setOpened(false)}>
								<ListItemIcon>
									<AccountBox />
								</ListItemIcon>
								<Link
									sx={{ textDecoration: 'none', color: 'text.primary' }}
									component={RouterLink}
									to="/user"
								>
									Profile
								</Link>
							</MenuItem>
							<MenuItem onClick={() => setOpened(false)} divider>
								<ListItemIcon>
									<Cog />
								</ListItemIcon>
								<Link
									sx={{ textDecoration: 'none', color: 'text.primary' }}
									component={RouterLink}
									to="/usersettings"
								>
									Settings
								</Link>
							</MenuItem>
							<MenuItem
								sx={{ color: 'error.main' }}
								onClick={() => {
									setOpened(false)
									onSignOutClick()
								}}
							>
								<ListItemIcon>
									<Logout color="error" />
								</ListItemIcon>
								Log out
							</MenuItem>
						</Menu>
					</Stack>
				</Toolbar>
			</AppBar>
		</>
	)
}
