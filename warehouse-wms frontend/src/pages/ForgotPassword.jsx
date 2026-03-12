import { useState } from "react";
import BASE_URL from "../config";
import styles from "../styles/pages/Login.module.css";
import logoImage from "../assets/image.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Check your email for reset link");
      } else {
        setError(data.error || "Error sending reset email");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <img
            src={logoImage}
            alt="Warehouse logo"
            className={styles.logoIcon}
          />
          <h1 className={styles.logoTitle}>TPC</h1>
          <h1 className={styles.logoTitle}>Warehouse WMS</h1>
          <p className={styles.logoSubtitle}>Reset Your Password</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email *</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: "1rem" }}>
          <p>
            <a href="/login">Go back to login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
