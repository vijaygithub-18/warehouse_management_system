import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/components/Navbar.module.css";
import BASE_URL from "../config";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true",
  );
  const [todayStats, setTodayStats] = useState({ inward: 0, outward: 0 });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load dark mode preference
  useEffect(() => {
    const init = async () => {
      const savedMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedMode);
      if (savedMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    };
    init();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // loader functions hoisted so effects can call them immediately
  async function loadTodayStats() {
    try {
      const today = new Date().toISOString().split("T")[0];

      const inwardRes = await fetch(`${BASE_URL}/inward/all`);
      const inwardData = await inwardRes.json();
      const todayInward = inwardData.filter((i) => i.date === today).length;

      const outwardRes = await fetch(`${BASE_URL}/outward/all`);
      const outwardData = await outwardRes.json();
      const todayOutward = outwardData.filter((o) => o.date === today).length;

      setTodayStats({ inward: todayInward, outward: todayOutward });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetch(`${BASE_URL}/inventory/stock`);
      const data = await res.json();
      console.log("📊 All inventory items:", data);

      const lowStock = data.filter((item) => item.stock < 50);
      console.log("⚠️ Low stock items (< 50):", lowStock);
      console.log(
        "📋 Detailed low stock:",
        lowStock.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          stock: item.stock,
          stockType: typeof item.stock,
        })),
      );

      // Get dismissed notifications from localStorage
      const dismissed = JSON.parse(
        localStorage.getItem("dismissedNotifications") || "[]",
      );
      console.log("🚫 Dismissed notifications:", dismissed);

      const notifs = lowStock
        .filter((item) => !dismissed.includes(item.id))
        .map((item) => {
          const stockValue = parseInt(item.stock) || 0;
          return {
            id: item.id,
            productId: item.id,
            title: "Low Stock Alert",
            text: `${item.name} (${item.sku}) - Only ${stockValue} units left`,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "warning",
            read: false,
          };
        });

      console.log("🔔 Final notifications to show:", notifs);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
    }
  }

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const fetchNotifs = async () => {
      await loadNotifications();
    };
    fetchNotifs();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh notifications when route changes
  useEffect(() => {
    const fetchNotifs = async () => {
      await loadNotifications();
    };
    fetchNotifs();
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.userSection}`)) {
        setShowUserDropdown(false);
      }
      if (!e.target.closest(`.${styles.iconButton}`)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Load today's stats
  useEffect(() => {
    const fetchStats = async () => {
      await loadTodayStats();
    };
    fetchStats();
  }, []);

  const handleClearAll = () => {
    const dismissed = notifications.map((n) => n.productId);
    localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleResetDismissed = () => {
    localStorage.removeItem("dismissedNotifications");
    loadNotifications();
    alert("✅ Dismissed notifications cleared! Notifications will reload.");
  };

  const handleDismissNotification = (notifId) => {
    const notif = notifications.find((n) => n.id === notifId);
    if (notif) {
      const dismissed = JSON.parse(
        localStorage.getItem("dismissedNotifications") || "[]",
      );
      dismissed.push(notif.productId);
      localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
    }

    const updated = notifications.filter((n) => n.id !== notifId);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
  };

  const handleMarkAsRead = (notifId) => {
    const updated = notifications.map((n) =>
      n.id === notifId ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/": "Dashboard",
      "/products": "Products",
      "/categories": "Categories",
      "/inventory": "Stock Overview",
      "/racks": "Racks",
      "/suppliers": "Suppliers",
      "/customers": "Customers",
      "/users": "User Management",
      "/adjustments": "Stock Adjustments",
      "/inward": "Inward",
      "/outward": "Outward",
      "/reports": "Reports",
    };
    return titles[path] || "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products with search
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);

    if (newMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const userName = user.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className={styles.navbar}>
      <div className={styles.leftSection}>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>

        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search products, SKU, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.rightSection}>
        {/* Date & Time */}
        <div className={styles.dateTime}>
          <p className={styles.date}>
            {currentTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className={styles.time}>
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.statItem}>
            <p className={styles.statLabel}>Today In</p>
            <p className={`${styles.statValue} ${styles.statInward}`}>
              {todayStats.inward}
            </p>
          </div>
          <div className={styles.statItem}>
            <p className={styles.statLabel}>Today Out</p>
            <p className={`${styles.statValue} ${styles.statOutward}`}>
              {todayStats.outward}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className={styles.iconButton}
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                loadNotifications(); // Refresh when opening
              }
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <div>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className={styles.notificationActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={loadNotifications}
                    title="Refresh notifications"
                  >
                    🔄
                  </button>
                  {notifications.length > 0 && (
                    <>
                      <button
                        className={styles.actionBtn}
                        onClick={handleMarkAllAsRead}
                        title="Mark all as read"
                      >
                        ✓
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={handleClearAll}
                        title="Clear all"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
              {notifications.length > 0 ? (
                <div className={styles.notificationList}>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`${styles.notificationItem} ${notif.read ? styles.read : styles.unread}`}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTop}>
                          <p className={styles.notificationTitle}>
                            {notif.title}
                          </p>
                          <button
                            className={styles.dismissBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissNotification(notif.id);
                            }}
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>
                        <p className={styles.notificationText}>{notif.text}</p>
                        <p className={styles.notificationTime}>{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyNotifications}>
                  <div className={styles.emptyIcon}>🔕</div>
                  <p>No notifications</p>
                  <p className={styles.emptySubtext}>You're all caught up!</p>
                  <button
                    className={styles.resetButton}
                    onClick={handleResetDismissed}
                  >
                    🔄 Show Dismissed Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          className={styles.themeToggle}
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* User Dropdown */}
        <div className={styles.userSection}>
          <div
            className={styles.userInfo}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div className={styles.userAvatar}>{userInitial}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{user.role || "Role"}</span>
            </div>
            <span className={styles.dropdownArrow}>▼</span>
          </div>

          {showUserDropdown && (
            <div className={styles.userDropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate("/profile");
                }}
              >
                👤 Profile
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate("/settings");
                }}
              >
                ⚙️ Settings
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate("/reports");
                }}
              >
                📊 My Activity
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserDropdown(false);
                  handleLogout();
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
