import { NavLink, Outlet } from "react-router";
import { Moon, Sun } from "lucide-react";
import { APP_NAME } from "@/constants/branding";
import { getVisibleNavItems } from "@/constants/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNavigationPreferences } from "@/contexts/navigation-preferences-context";
import { useTheme } from "@/contexts/theme-context";
import { DocumentTitle } from "./DocumentTitle";
import { PageTransition } from "@/components/ui/PageTransition";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const { preferences } = useNavigationPreferences();
  const { currentTheme, toggleTheme } = useTheme();

  const navItems = getVisibleNavItems(preferences);

  return (
    <div className={styles.shell}>
      <DocumentTitle />
      <header className={styles.header}>
        <div className={styles.brand}>
          <img
            className={styles.brandMark}
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={28}
            height={28}
          />
          <span className={styles.brandName}>{APP_NAME}</span>
        </div>
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
          <PageTransition>
            <Outlet />
          </PageTransition>
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
