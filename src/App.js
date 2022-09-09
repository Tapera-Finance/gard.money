import { Provider } from "react-redux";
import "./App.css";
import HomeContent from "./pages/HomeContent";
import Main from "./components/Main";
import AccountContent from "./pages/AccountContent";
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
