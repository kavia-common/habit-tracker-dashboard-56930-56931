import React from "react";
import styles from "./Button.module.css";

/**
 * PUBLIC_INTERFACE
 * Button component with variants.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
