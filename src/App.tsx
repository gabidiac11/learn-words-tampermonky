import { useEffect, useState } from "react";
import Login from "./auth/Login";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuthInit } from "./auth/authHooks";
import { LoaderView } from "./components/Loader";
import { routes as r, routes } from "./routes";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { NotFound } from "./pages/NotFound";
import { AddRecordUrlPage } from "./pages/add-record/AddRecordUrlPage";
import { Button } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const { user, isVerifying } = useAuthInit();
  const isAuth = !!user;
  if (isVerifying) {
    return <LoaderView />;
  }
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <MemoryRouter>
        {user ? (
          <Routes>
            <Route path={r.Url.path} element={<AddRecordUrlPage />} />
            <Route path={"/404"} element={<NotFound />} />
            <Route
              path="*"
              element={<DefaultRouteRedirection isAuth={isAuth} />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path={r.Login.path} element={<Login />} />
            <Route
              path="*"
              element={<DefaultRouteRedirection isAuth={isAuth} />}
            />
          </Routes>
        )}
      </MemoryRouter>
    </ErrorBoundary>
  );
}

function AppWrapper() {
  const [open, setOpen] = useState(false);
  return (
    <div className="learn-word-app-master-root">
      {!open && (
        <button
          className="learn-word-app-activator"
          onClick={() => setOpen(true)}
        >
          <div>L</div>
        </button>
      )}
      {open && (
        <div className="learn-word-app-wrapper">
          <div className="learn-word-app-wrapper-inner">
            <div className="learn-wor-app-close-wrapper">
              <Button
                variant="contained"
                className="learn-word-app-activator-close mr-10"
                onClick={() => signOut(auth)}
              >
                Sign out
              </Button>
              <Button
                variant="contained"
                className="learn-word-app-activator-close"
                onClick={() => setOpen(false)}
              >
                x
              </Button>
            </div>
            <App />
          </div>
        </div>
      )}
    </div>
  );
}

const DefaultRouteRedirection = (props: { isAuth: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!props.isAuth) {
      navigate("/login", { replace: true });
      return;
    }
    if (
      location.pathname === "/login" ||
      location.pathname === "/" ||
      !location.pathname
    ) {
      navigate(routes.Url.path, { replace: true });
    } else {
      navigate("/404", { replace: true });
    }
  }, [location.pathname, navigate, props.isAuth]);

  return <LoaderView />;
};

export default AppWrapper;
