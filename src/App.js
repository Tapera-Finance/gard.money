import { Provider } from 'react-redux'
import './App.css'
import HomeContent from './components/HomeContent'
import Main from './components/Main'
import WalletContent from './components/WalletContent'
import store from './redux/store'
import Routes from './components/Routes'

function App() {
  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  )
}

export default App
