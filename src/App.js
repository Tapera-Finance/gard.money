import { Provider } from "react-redux";
import "./App.css";
import HomeContent from "./components/HomeContent";
import Main from "./components/Main";
import WalletContent from "./components/WalletContent";
import store from "./redux/store";
import Routes from "./components/Routes";
import ThemeContext from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeContext>
      <Provider store={store}>
        <Routes />
      </Provider>
    </ThemeContext>
  );
}

export default App;
