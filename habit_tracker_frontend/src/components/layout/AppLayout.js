import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import styles from "./AppLayout.module.css";

/**
 * PUBLIC_INTERFACE
 * App layout shell containing sidebar + top navigation + main content area.
 */
export default function AppLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentColumn}>
        <TopNav />
        <main className={styles.main} role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
