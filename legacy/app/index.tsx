import { Redirect } from "expo-router";

export default function Index() {
  // Route racine requise (ex: ouverture via 2026app:///)
  // On redirige vers l'onglet principal ; la logique d'auth dans (tabs)/_layout
  // renverra automatiquement vers /Login si nécessaire.
  return <Redirect href="/Habit" />;
}
