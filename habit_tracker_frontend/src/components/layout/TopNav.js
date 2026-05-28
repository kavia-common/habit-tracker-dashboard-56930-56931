import React from "react";
import styles from "./TopNav.module.css";
import { useTheme } from "../../state/theme";
import { getEnvConfig } from "../../config/env";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar: shows quick overview and app actions.
 */
export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { apiBase } = getEnvConfig();

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <div className={styles.pageTitle}>Your habits</div>
        <div className={styles.meta}>
          Connected to <span className={styles.mono}>{apiBase}</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.actionBtn} type="button" onClick={toggleTheme}>
          Theme: {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
    </header>
  );
}
