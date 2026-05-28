import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Item({ to, label, hint }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${styles.item} ${styles.active}` : styles.item
      }
    >
      <div className={styles.itemLabel}>{label}</div>
      <div className={styles.itemHint}>{hint}</div>
    </NavLink>
  );
}

/**
 * PUBLIC_INTERFACE
 * Left sidebar navigation.
 */
export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Primary">
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">
          HT
        </div>
        <div>
          <div className={styles.title}>Habit Tracker</div>
          <div className={styles.subtitle}>Build consistency</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <Item to="/dashboard" label="Dashboard" hint="Overview & progress" />
        <Item to="/calendar" label="Calendar" hint="Daily completions" />
        <Item to="/settings" label="Settings" hint="Reminders & theme" />
        <Item to="/export" label="Export" hint="Download your data" />
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerText}>
          Tip: Add a habit, then click “Done” each day.
        </div>
      </div>
    </aside>
  );
}
