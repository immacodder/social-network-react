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

export function AppBarComponent() {
	const [opened, setOpened] = useState(false)
	const { push } = useHistory()
	const anchorEl = useRef<HTMLDivElement>(null)

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
						<Avatar className="button" onClick={() => setOpened(true)} ref={anchorEl}>
							TK
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
