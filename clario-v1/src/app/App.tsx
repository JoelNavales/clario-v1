import { useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { getFromStorage } from "../utils/localStorage";

function FullApp() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onboarded = getFromStorage<boolean>("clario_onboarded", false);
    if (!onboarded && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [location.pathname, navigate]);

  return element;
}

export default function App() {
  return <FullApp />;
}

