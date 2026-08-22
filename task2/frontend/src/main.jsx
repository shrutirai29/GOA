import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import TermsOfService from "./Tos.jsx";
import "./styles.css";

function Router() {
  const path = window.location.pathname;
  if (path === "/tos") return <TermsOfService />;
  return <App />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
