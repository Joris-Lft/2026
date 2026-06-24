import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { createUser } from "@/services/airtable";
import styles from "./AuthPage.module.css";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUser(email.trim(), password, {
        Name: name.trim(),
      });

      if (result.user) {
        setSuccess(
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        );
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setError(
          result.error ||
            "Impossible de créer le compte. L'email est peut-être déjà utilisé.",
        );
      }
    } catch {
      setError("Une erreur est survenue lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Inscription</h1>
        <p className={styles.subtitle}>
          Créez un compte pour accéder à l&apos;application
        </p>

        <form className={styles.form} onSubmit={handleSignup}>
          <label className={styles.field}>
            <span className={styles.label}>Nom</span>
            <input
              className={styles.input}
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Mot de passe</span>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <span className={styles.hint}>Au moins 6 caractères</span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmer le mot de passe</span>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>

          <p className={styles.footer}>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
