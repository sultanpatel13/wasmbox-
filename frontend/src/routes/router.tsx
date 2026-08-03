import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { NotFound } from "../pages/NotFound";
import { coreRoutes } from "./index";
import { AppLayout } from "../components/AppLayout";

const routeElements = coreRoutes.map((route) => ({
  path: route.path,
  element: route.element,
}));

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          ...routeElements.map((r) => ({ path: `/${r.path}`, element: r.element })),
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

export function RouterProvider() {
  return <Outlet />;
}