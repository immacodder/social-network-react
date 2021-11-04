import { Container, Typography } from "@mui/material"
import { Box } from "@mui/system"

export function AppMessage(p: { text: string }) {
	return (
		<Container>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					textAlign: "center",
					alignItems: "center",
					height: "calc(100vh - 100px)",
				}}
			>
				<Typography variant="h5">{p.text}</Typography>
			</Box>
		</Container>
	)
}
