import React, { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useTheme } from "../state/theme";
import { getEnvConfig } from "../config/env";
import styles from "./SettingsPage.module.css";

/**
 * PUBLIC_INTERFACE
 * Settings page: theming + reminders placeholder + environment display.
 */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const env = getEnvConfig();
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const wsHint = useMemo(() => {
    return env.wsUrl ? `WebSocket: ${env.wsUrl}` : "WebSocket not configured";
  }, [env.wsUrl]);

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.h1}>Settings</div>
        <div className={styles.sub}>Customize your experience.</div>
      </div>

      <div className={styles.grid}>
        <Card>
          <div className={styles.cardTitle}>Theme</div>
          <div className={styles.cardHint}>
            Light/dark mode is stored on this device.
          </div>

          <div className={styles.row}>
            <Button
              variant={theme === "light" ? "primary" : "ghost"}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "ghost"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
          </div>
        </Card>

        <Card>
          <div className={styles.cardTitle}>Reminders</div>
          <div className={styles.cardHint}>
            Browser notifications require user permission.
          </div>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
            />
            <span>Enable reminder notifications (UI-only)</span>
          </label>

          <div className={styles.note}>
            This UI is ready to wire to backend reminder scheduling when endpoints are available.
          </div>
        </Card>

        <Card>
          <div className={styles.cardTitle}>Connectivity</div>
          <div className={styles.cardHint}>From .env (REACT_APP_* variables).</div>

          <div className={styles.kv}>
            <div className={styles.k}>API Base</div>
            <div className={styles.v}>{env.apiBase}</div>
          </div>
          <div className={styles.kv}>
            <div className={styles.k}>Frontend</div>
            <div className={styles.v}>{env.frontendUrl}</div>
          </div>
          <div className={styles.kv}>
            <div className={styles.k}>Real-time</div>
            <div className={styles.v}>{wsHint}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
