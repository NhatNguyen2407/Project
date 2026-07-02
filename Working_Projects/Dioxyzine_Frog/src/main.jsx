import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./styles/index.css";
import { AuthProvider } from "./app/context/AuthContext.jsx"; 

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);