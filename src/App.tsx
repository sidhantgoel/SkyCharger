import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MainPage from "./MainPage";

import "./styles/index.scss";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Stack } from "@mui/material";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

const container = document.getElementById("root");

const theme = createTheme({
  typography: {
    fontSize: 9,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CssBaseline />
          <StrictMode>
            <MainPage />
          </StrictMode>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
