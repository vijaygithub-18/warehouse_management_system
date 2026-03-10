import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/components/Sidebar.module.css";

// actual logo provided by user in assets folder
import logoImage from "../assets/image.png";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <Link to="/" className={styles.logo}>
          {/* use an actual image file instead of the emoji */}
          <img
            src={logoImage}
            alt="Warehouse logo"
            className={styles.logoIcon}
          />
          <div className={styles.logoText}>
            <h1 className={styles.logoTitle}>Warehouse WMS</h1>
            <p className={styles.logoSubtitle}>Thee Packaging Company</p>
            {/* <p className={styles.logoSubtitle}>Management System</p> */}
          </div>
        </Link>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Main Menu</h3>
          <div className={styles.navItem}>
            <Link
              to="/"
              className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/products"
              className={`${styles.navLink} ${isActive("/products") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📦</span>
              <span>Products</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/categories"
              className={`${styles.navLink} ${isActive("/categories") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🏷️</span>
              <span>Categories</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/inventory"
              className={`${styles.navLink} ${isActive("/inventory") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📊</span>
              <span>Stock Overview</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/racks"
              className={`${styles.navLink} ${isActive("/racks") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🗄️</span>
              <span>Racks</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/suppliers"
              className={`${styles.navLink} ${isActive("/suppliers") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🏭</span>
              <span>Suppliers</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/customers"
              className={`${styles.navLink} ${isActive("/customers") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>👥</span>
              <span>Customers</span>
            </Link>
          </div>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Sales & Purchase</h3>
          <div className={styles.navItem}>
            <Link
              to="/sales-orders"
              className={`${styles.navLink} ${isActive("/sales-orders") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🛒</span>
              <span>Sales Orders</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/purchase-orders"
              className={`${styles.navLink} ${isActive("/purchase-orders") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🛍️</span>
              <span>Purchase Orders</span>
            </Link>
          </div>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Operations</h3>
          <div className={styles.navItem}>
            <Link
              to="/inward"
              className={`${styles.navLink} ${isActive("/inward") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📥</span>
              <span>Inward</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/outward"
              className={`${styles.navLink} ${isActive("/outward") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📤</span>
              <span>Outward</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/shipments"
              className={`${styles.navLink} ${isActive("/shipments") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>🚚</span>
              <span>Shipments</span>
            </Link>
          </div>

          <div className={styles.navItem}>
            <Link
              to="/adjustments"
              className={`${styles.navLink} ${isActive("/adjustments") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>⚖️</span>
              <span>Adjustments</span>
            </Link>
          </div>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Analytics</h3>
          <div className={styles.navItem}>
            <Link
              to="/reports"
              className={`${styles.navLink} ${isActive("/reports") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📈</span>
              <span>Reports</span>
            </Link>
          </div>
          <div className={styles.navItem}>
            <Link
              to="/activity"
              className={`${styles.navLink} ${isActive("/activity") ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>📋</span>
              <span>Activity Logs</span>
            </Link>
          </div>
        </div>

        {user.role === "admin" && (
          <div className={styles.navSection}>
            <h3 className={styles.sectionTitle}>Administration</h3>
            <div className={styles.navItem}>
              <Link
                to="/users"
                className={`${styles.navLink} ${isActive("/users") ? styles.active : ""}`}
              >
                <span className={styles.navIcon}>👤</span>
                <span>User Management</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.username || "User"}</p>
            <p className={styles.userRole}>{user.role || "Role"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "1rem",
            fontWeight: "600",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
