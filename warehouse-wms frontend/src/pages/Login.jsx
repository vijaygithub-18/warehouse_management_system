import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/pages/Login.module.css";
import logoImage from "../assets/image.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || username.trim() === "") {
      setError("Please enter username");
      return;
    }
    if (!password || password.trim() === "") {
      setError("Please enter password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to dashboard
        navigate("/");
        window.location.reload(); // Reload to update auth state
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
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
          <p className={styles.logoSubtitle}>Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Username *</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password *</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: "1rem" }}>
          <p>
            <a href="/forgot-password">Forgot password?</a>
          </p>
          <p>
            <a href="/register">Create an account</a>
          </p>
          <p>Default Admin: username: admin, password: admin123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
