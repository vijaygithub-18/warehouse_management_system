import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./components/ToastContext";
import "./index.css";
import "./styles/darkmode.css";
import "./styles/darkmode-pages.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/print.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>,
);
