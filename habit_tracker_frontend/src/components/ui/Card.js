import React from "react";
import styles from "./Card.module.css";

/**
 * PUBLIC_INTERFACE
 * Simple card container.
 */
export default function Card({ children, className = "", ...rest }) {
  return (
    <section className={`${styles.card} ${className}`} {...rest}>
      {children}
    </section>
  );
}
