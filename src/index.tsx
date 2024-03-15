import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./firebase";
import { AppContextProvider } from "./app-context/AppContext";
import { AppSnackbar } from "./components/AppSnackbar";

const root = ReactDOM.createRoot(
  document.getElementById("learn-words-app-root") as HTMLElement
);

// TODO: render with event listener on location change
// TODO: add parsing for wikipedia, radio freedom, mobile websites
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
      <AppSnackbar />
    </AppContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
