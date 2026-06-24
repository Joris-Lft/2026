import { NavLink, Outlet } from "react-router";
import {
  BarChart3,
  Home,
  Moon,
  Sun,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import styles from "./AppLayout.module.css";

const navItems = [
  { to: "/habits", label: "Habits", icon: BarChart3 },
  { to: "/profil", label: "Profil", icon: UserCircle },
];

const sidebarItems = [
  ...navItems,
  { to: "/accueil", label: "Accueil", icon: Home },
  { to: "/perso", label: "Perso", icon: User },
  { to: "/commun", label: "Commun", icon: Users },
];

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>2026</span>
        {isAuthenticated && (
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Changer de thème"
          >
            {currentTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </header>

      <div className={styles.body}>
        {isAuthenticated && (
        <nav className={styles.sidebar} aria-label="Navigation principale">
          {sidebarItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <Icon size={22} />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>
        )}

        <main className={`${styles.main} ${!isAuthenticated ? styles.mainGuest : ""}`}>
          <Outlet />
        </main>
      </div>

      {isAuthenticated && (
      <nav className={styles.bottomNav} aria-label="Navigation mobile">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? `${styles.bottomLink} ${styles.bottomLinkActive}`
                : styles.bottomLink
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      )}
    </div>
  );
}
