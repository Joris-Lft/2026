import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageShell } from "@/components/ui/PageShell";
import { useAuth } from "@/contexts/auth-context";
import styles from "./AuthPage.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      navigate("/habits", { replace: true });
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  return (
    <PageShell className={styles.page}>
      <Card elevated padded className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>
        <p className={styles.subtitle}>
          Connectez-vous pour accéder à l&apos;application
        </p>

        <form className={styles.form} onSubmit={handleLogin}>
          <FormField label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Mot de passe" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </FormField>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth loading={isLoading}>
            Se connecter
          </Button>

          <p className={styles.footer}>
            Pas encore de compte ?{" "}
            <Link to="/signup">S&apos;inscrire</Link>
          </p>
        </form>
      </Card>
    </PageShell>
  );
}
