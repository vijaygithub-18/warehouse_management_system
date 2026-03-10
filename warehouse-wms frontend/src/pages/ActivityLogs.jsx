import { useEffect, useState, useCallback } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Reports.module.css";
import BASE_URL from "../config";

function ActivityLogs() {
  const toast = useToast();
  const token = localStorage.getItem("token");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState({
    action: "",
    entity_type: "",
    user_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Define all loaders first before effects use them
  const loadUsers = useCallback(async () => {
    try {
      console.log("📊 Fetching users...");
      const res = await fetch(`${BASE_URL}/activity/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("✅ Users loaded:", data);
      setUsers(data);
    } catch (err) {
      console.error("❌ Failed to load users:", err);
      toast.error("Failed to load users");
    }
  }, [token, toast]);

  const loadLogs = useCallback(async () => {
    try {
      console.log("📝 Fetching logs with filter:", filter);
      let url = `${BASE_URL}/activity/all?limit=200`;
      if (filter.action) url += `&action=${filter.action}`;
      if (filter.entity_type) url += `&entity_type=${filter.entity_type}`;
      if (filter.user_id) url += `&user_id=${filter.user_id}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("✅ Logs loaded:", data.length, "records");
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load logs:", err);
      toast.error("Failed to load activity logs");
      setLoading(false);
    }
  }, [filter, token, toast]);

  const loadStats = useCallback(async () => {
    try {
      console.log("📈 Fetching stats...");
      const res = await fetch(`${BASE_URL}/activity/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("✅ Stats loaded:", data);
      setStats(data);
    } catch (err) {
      console.error("❌ Failed to load stats:", err);
      toast.error("Failed to load activity stats");
    }
  }, [token, toast]);

  const loadCurrentUser = useCallback(async () => {
    try {
      console.log("👤 Fetching current user...");
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Auth failed: ${res.status}`);
      }
      const data = await res.json();
      console.log("✅ Current user loaded:", data);
      setCurrentUser(data);
    } catch (err) {
      console.error("❌ Failed to load current user:", err);
      toast.error("Session expired. Please login again.");
      setLoading(false);
    }
  }, [token, toast]);

  // First effect: Load current user on mount
  useEffect(() => {
    console.log("🔄 Initial load: fetching current user");
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Second effect: Load logs and stats once currentUser is set
  useEffect(() => {
    if (!currentUser) {
      console.log("⏳ Waiting for currentUser to load...");
      return;
    }
    console.log("🔄 CurrentUser loaded, now fetching logs and stats");
    loadLogs();
    loadStats();
    if (currentUser.role === "admin") {
      loadUsers();
    }
  }, [currentUser, loadLogs, loadStats, loadUsers]);

  // Third effect: Reload logs when filter changes
  useEffect(() => {
    if (!currentUser) return;
    console.log("🔄 Filter changed, reloading logs");
    loadLogs();
  }, [filter, loadLogs, currentUser]);

  const clearOldLogs = async (days) => {
    if (currentUser?.role !== "admin") {
      toast.error("Only admins can clear logs");
      return;
    }
    if (
      !window.confirm(
        `Delete all logs older than ${days} days? This cannot be undone.`,
      )
    )
      return;
    try {
      const res = await fetch(`${BASE_URL}/activity/clear?days=${days}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.deleted_count === 0) {
          toast.info(
            `No logs found older than ${days} days. All your logs are recent!`,
          );
        } else {
          toast.success(
            `Successfully deleted ${data.deleted_count} logs older than ${days} days.`,
          );
        }
        setShowClearModal(false);
        loadLogs();
        loadStats();
      } else {
        toast.error(data.error || "Failed to delete logs");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error. Check console for details.");
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      LOGIN: { color: "#10b981", icon: "🔓" },
      LOGOUT: { color: "#6b7280", icon: "🔒" },
      CREATE: { color: "#3b82f6", icon: "➕" },
      UPDATE: { color: "#f59e0b", icon: "✏️" },
      DELETE: { color: "#ef4444", icon: "🗑️" },
    };
    const badge = badges[action] || { color: "#6b7280", icon: "📝" };
    return (
      <span
        style={{
          background: badge.color,
          color: "white",
          padding: "0.25rem 0.75rem",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "600",
        }}
      >
        {badge.icon} {action}
      </span>
    );
  };

  const getEntityBadge = (entityType) => {
    const colors = {
      AUTH: "#8b5cf6",
      PRODUCT: "#3b82f6",
      INWARD: "#10b981",
      OUTWARD: "#ef4444",
      USER: "#f59e0b",
      SUPPLIER: "#06b6d4",
      CUSTOMER: "#ec4899",
    };
    return (
      <span
        style={{
          background: colors[entityType] || "#6b7280",
          color: "white",
          padding: "0.25rem 0.75rem",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "600",
        }}
      >
        {entityType}
      </span>
    );
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading activity logs...
      </div>
    );
  }

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 Activity Logs</h1>
          <p className={styles.subtitle}>
            {currentUser?.role === "admin" &&
              "Track all user actions and system activities"}
            {currentUser?.role === "manager" &&
              "View your activities and staff activities"}
            {currentUser?.role === "staff" && "View your activity history"}
          </p>
        </div>
        {currentUser?.role === "admin" && (
          <button
            onClick={() => setShowClearModal(true)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🗑️ Clear Old Logs
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>
            Total Activities
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "2rem",
              fontWeight: "700",
            }}
          >
            {stats.total_activities || 0}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>
            Active Users
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "2rem",
              fontWeight: "700",
            }}
          >
            {stats.active_users || 0}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>Today</p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "2rem",
              fontWeight: "700",
            }}
          >
            {stats.today_activities || 0}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>
            This Week
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "2rem",
              fontWeight: "700",
            }}
          >
            {stats.week_activities || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {currentUser?.role === "admin" && (
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
              }}
            >
              Filter by User
            </label>
            <select
              value={filter.user_id}
              onChange={(e) =>
                setFilter({ ...filter, user_id: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            Filter by Action
          </label>
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            Filter by Entity
          </label>
          <select
            value={filter.entity_type}
            onChange={(e) =>
              setFilter({ ...filter, entity_type: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            <option value="">All Entities</option>
            <option value="AUTH">Authentication</option>
            <option value="PRODUCT">Products</option>
            <option value="INWARD">Inward</option>
            <option value="OUTWARD">Outward</option>
            <option value="USER">Users</option>
            <option value="SUPPLIER">Suppliers</option>
            <option value="CUSTOMER">Customers</option>
          </select>
        </div>

        <button
          onClick={() =>
            setFilter({ action: "", entity_type: "", user_id: "" })
          }
          style={{
            padding: "0.75rem 1.5rem",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            marginTop: "1.5rem",
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Activity Logs Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
            Activity History ({logs.length} records)
          </h3>
        </div>

        {logs.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      Action
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      Entity
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td
                        style={{
                          padding: "1rem",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        {log.formatted_time}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "600",
                              fontSize: "0.875rem",
                            }}
                          >
                            {log.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600" }}>
                            {log.username}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {getActionBadge(log.action)}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {getEntityBadge(log.entity_type)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                      >
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={logs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p>No activity logs found</p>
          </div>
        )}
      </div>

      {/* Clear Logs Modal */}
      {showClearModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowClearModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.5rem",
                fontWeight: "600",
              }}
            >
              Clear Old Activity Logs
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Select how old logs you want to delete. This action cannot be
              undone.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <button
                onClick={() => clearOldLogs(30)}
                style={{
                  padding: "1rem",
                  background: "#f3f4f6",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  textAlign: "left",
                }}
              >
                🗓️ Delete logs older than 30 days
              </button>
              <button
                onClick={() => clearOldLogs(60)}
                style={{
                  padding: "1rem",
                  background: "#f3f4f6",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  textAlign: "left",
                }}
              >
                📅 Delete logs older than 60 days
              </button>
              <button
                onClick={() => clearOldLogs(90)}
                style={{
                  padding: "1rem",
                  background: "#f3f4f6",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  textAlign: "left",
                }}
              >
                📆 Delete logs older than 90 days
              </button>
            </div>
            <button
              onClick={() => setShowClearModal(false)}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.5rem",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogs;
