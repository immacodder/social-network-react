import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { Sign } from './views/Sign'
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom'
import { Home } from './views/Home'
import {AppBarComponent} from './components/AppBar'
import { SearchPage } from './views/SearchPage'

console.clear()
export function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AppBarComponent />
        <Switch>
          <Route path="/signup">
            <Sign isSignIn={false} />
          </Route>
          <Route path="/signin">
            <Sign isSignIn={true} />
          </Route>
          <Route path="/searchpage">
            <SearchPage />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </LocalizationProvider>
  )
}
