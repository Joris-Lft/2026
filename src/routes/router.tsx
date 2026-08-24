import { createBrowserRouter } from "react-router";
import { RouteErrorPage } from "@/components/errors/RouteErrorPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { HabitPage } from "@/pages/HabitPage";
import { LoginPage } from "@/pages/LoginPage";
import { MeasurePage } from "@/pages/MeasurePage";
import { NotesPage } from "@/pages/NotesPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { CagnottePage } from "@/pages/CagnottePage";
import { ProfilPage } from "@/pages/ProfilPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { SignupPage } from "@/pages/SignupPage";
import { VoyageDetailPage } from "@/pages/VoyageDetailPage";
import { VoyagesPage } from "@/pages/VoyagesPage";
import { DefaultRedirect } from "@/routes/DefaultRedirect";
import { FeatureRoute } from "@/routes/FeatureRoute";
import { GuestRoute, ProtectedRoute } from "@/routes/RouteGuards";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DefaultRedirect /> },
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <LoginPage />, handle: { title: "Connexion" } },
          { path: "signup", element: <SignupPage />, handle: { title: "Inscription" } },
          { path: "forgot-password", element: <ForgotPasswordPage />, handle: { title: "Mot de passe oublié" } },
          { path: "reset-password", element: <ResetPasswordPage />, handle: { title: "Réinitialisation" } },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "habits",
            handle: { title: "Habits" },
            element: (
              <FeatureRoute feature="habits">
                <HabitPage />
              </FeatureRoute>
            ),
          },
          {
            path: "measures",
            handle: { title: "Mensurations" },
            element: (
              <FeatureRoute feature="measures">
                <MeasurePage />
              </FeatureRoute>
            ),
          },
          { path: "notes", element: <NotesPage />, handle: { title: "Notes" } },
          { path: "voyages", element: <VoyagesPage />, handle: { title: "Projets" } },
          {
            path: "voyages/cagnotte",
            element: <CagnottePage />,
            handle: { title: "Cagnotte" },
          },
          {
            path: "voyages/:travelId",
            element: <VoyageDetailPage />,
            handle: { title: "Projet" },
          },
          { path: "profil", element: <ProfilPage />, handle: { title: "Profil" } },
        ],
      },
      { path: "*", element: <NotFoundPage />, handle: { title: "Page introuvable" } },
    ],
  },
  ],
  { basename: basename || undefined },
);
