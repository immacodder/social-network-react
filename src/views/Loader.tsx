import { CircularProgress } from "@mui/material"
import { Box } from "@mui/system"

export function Loader() {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "calc(100vh - 100px)",
			}}
		>
			<CircularProgress color="primary" />
		</Box>
	)
}
