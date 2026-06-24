import { createBrowserRouter, Navigate } from "react-router";
import { RouteErrorPage } from "@/components/errors/RouteErrorPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AccueilPage } from "@/pages/AccueilPage";
import { CommunPage } from "@/pages/CommunPage";
import { HabitPage } from "@/pages/HabitPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PersoPage } from "@/pages/PersoPage";
import { ProfilPage } from "@/pages/ProfilPage";
import { SignupPage } from "@/pages/SignupPage";
import { GuestRoute, ProtectedRoute } from "@/routes/RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/habits" replace /> },
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "habits", element: <HabitPage /> },
          { path: "profil", element: <ProfilPage /> },
          { path: "accueil", element: <AccueilPage /> },
          { path: "perso", element: <PersoPage /> },
          { path: "commun", element: <CommunPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
