import { createTheme, CssBaseline } from "@mui/material"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { store } from "./store"
import { BrowserRouter as Router } from "react-router-dom"
import { LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import { AuthWrapper } from "./AuthWrapper"
import { ThemeProvider } from "@emotion/react"

ReactDOM.render(
	<Provider store={store}>
		<CssBaseline>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Router>
					<AuthWrapper />
				</Router>
			</LocalizationProvider>
		</CssBaseline>
	</Provider>,
	document.querySelector("#root")
)
