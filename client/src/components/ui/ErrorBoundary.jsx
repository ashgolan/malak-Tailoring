

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // في الإنتاج: أرسل إلى Sentry أو نظام logging خارجي
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) return children;

    // Custom fallback من props
    if (fallback) return fallback;

    // Default UI
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.icon}>⚠️</div>
          <h2 style={styles.title}>אירעה שגיאה בלתי צפויה</h2>
          <p style={styles.subtitle}>
            משהו השתבש בחלק זה של האפליקציה.
            <br />
            ניתן לנסות שוב או לרענן את הדף.
          </p>

          {/* הצג פרטי שגיאה רק בפיתוח */}
          {import.meta.env.DEV && error && (
            <pre style={styles.code}>{error.message}</pre>
          )}

          <div style={styles.actions}>
            <button onClick={this.handleReset} style={styles.btnPrimary}>
              נסה שוב
            </button>
            <button
              onClick={() => window.location.reload()}
              style={styles.btnSecondary}
            >
              רענן דף
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ─── Inline styles (no external deps) ──────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    padding: "2rem",
    direction: "rtl",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "2.5rem 2rem",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1f2937",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.7,
    margin: "0 0 20px",
  },
  code: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#991b1b",
    textAlign: "left",
    direction: "ltr",
    overflowX: "auto",
    margin: "0 0 20px",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
