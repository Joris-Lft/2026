import { NavLink, Outlet } from "react-router";
import { Moon, Sun } from "lucide-react";
import {
  getVisibleNavItems,
} from "@/constants/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNavigationPreferences } from "@/contexts/navigation-preferences-context";
import { useTheme } from "@/contexts/theme-context";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const { preferences } = useNavigationPreferences();
  const { currentTheme, toggleTheme } = useTheme();

  const navItems = getVisibleNavItems(preferences);

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
            {navItems.map(({ to, label, icon: Icon }) => (
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
