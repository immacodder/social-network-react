import { CssBaseline } from '@material-ui/core'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter as Router } from 'react-router-dom'
import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { AuthWrapper } from './AuthWrapper'

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
	document.querySelector('#root'),
)
