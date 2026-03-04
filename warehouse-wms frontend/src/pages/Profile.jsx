import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";
import styles from "../styles/pages/Profile.module.css";

function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    department: "",
    location: ""
  });
  const [stats, setStats] = useState({ total: 0, inward: 0, outward: 0 });

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "",
          location: data.location || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const inwardRes = await fetch("http://localhost:3000/api/inward/all");
      const inwardData = await inwardRes.json();
      
      const outwardRes = await fetch("http://localhost:3000/api/outward/all");
      const outwardData = await outwardRes.json();

      setStats({
        inward: inwardData.length,
        outward: outwardData.length,
        total: inwardData.length + outwardData.length
      });
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const getRoleBadgeClass = () => {
    if (user?.role === "admin") return styles.roleAdmin;
    if (user?.role === "staff") return styles.roleStaff;
    return styles.roleManager;
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Update localStorage
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...localUser,
          username: data.user.username,
          email: data.user.email
        }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      location: user.location || ""
    });
    setIsEditing(false);
  };

  const getJoinDate = () => {
    if (!user?.created_at) return "N/A";
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getLastLogin = () => {
    if (!user?.last_login) return "Never";
    const date = new Date(user.last_login);
    return date.toLocaleString();
  };

  const handleExportData = () => {
    const userData = {
      ...user,
      stats: stats,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Profile data exported successfully!");
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load profile</div>;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>👤 My Profile</h1>
          <p className={styles.subtitle}>Manage your account information and preferences</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isEditing && (
            <button className={styles.cancelButton} onClick={handleCancel}>
              ❌ Cancel
            </button>
          )}
          <button 
            className={styles.editButton}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className={styles.overviewCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className={styles.statusIndicator}></div>
          </div>
          <div className={styles.userOverview}>
            <h2 className={styles.userName}>{user.username || "User"}</h2>
            <span className={`${styles.badge} ${getRoleBadgeClass()}`}>
              {user.role || "Role"}
            </span>
            <p className={styles.userEmail}>{user.email || "email@example.com"}</p>
            <p className={styles.joinDate}>📅 Joined {getJoinDate()}</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div>
              <p className={styles.statValue}>{stats.total}</p>
              <p className={styles.statLabel}>Total Actions</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📥</div>
            <div>
              <p className={styles.statValue}>{stats.inward}</p>
              <p className={styles.statLabel}>Inward Ops</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📤</div>
            <div>
              <p className={styles.statValue}>{stats.outward}</p>
              <p className={styles.statLabel}>Outward Ops</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📋 Personal Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Username</span>
            {isEditing ? (
              <input
                type="text"
                className={styles.input}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            ) : (
              <span className={styles.value}>{user.username || "N/A"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Email Address</span>
            {isEditing ? (
              <input
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            ) : (
              <span className={styles.value}>{user.email || "N/A"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Phone Number</span>
            {isEditing ? (
              <input
                type="tel"
                className={styles.input}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            ) : (
              <span className={styles.value}>{user.phone || "Not provided"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>User ID</span>
            <span className={styles.value}>#{user.id || "N/A"}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Department</span>
            {isEditing ? (
              <select
                className={styles.input}
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="Warehouse Operations">Warehouse Operations</option>
                <option value="Inventory Management">Inventory Management</option>
                <option value="Logistics">Logistics</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Administration">Administration</option>
              </select>
            ) : (
              <span className={styles.value}>{user.department || "Not specified"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Location</span>
            {isEditing ? (
              <select
                className={styles.input}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Select Location</option>
                <option value="Warehouse A">Warehouse A</option>
                <option value="Warehouse B">Warehouse B</option>
                <option value="Warehouse C">Warehouse C</option>
                <option value="Distribution Center">Distribution Center</option>
                <option value="Head Office">Head Office</option>
              </select>
            ) : (
              <span className={styles.value}>{user.location || "Not specified"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🔐 Account Details</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Account Status</span>
            <span className={styles.value} style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.activeIndicator}></span> Active
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Role</span>
            <span className={styles.value} style={{ textTransform: 'capitalize' }}>
              {user.role || "N/A"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Last Login</span>
            <span className={styles.value}>{getLastLogin()}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Account Created</span>
            <span className={styles.value}>{getJoinDate()}</span>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🔑 Permissions & Access</h3>
        <div className={styles.permissionsList}>
          {user.role === "admin" && (
            <>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Full System Access</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>User Management</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Reports & Analytics</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>System Configuration</span>
              </div>
            </>
          )}
          {user.role === "manager" && (
            <>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>View All Operations</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Generate Reports</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Approve Adjustments</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>❌</span>
                <span>User Management (Read Only)</span>
              </div>
            </>
          )}
          {user.role === "staff" && (
            <>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Inward Operations</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Outward Operations</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>✅</span>
                <span>Stock Adjustments</span>
              </div>
              <div className={styles.permissionItem}>
                <span className={styles.permissionIcon}>❌</span>
                <span>Reports Access (Limited)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>⚡ Quick Actions</h3>
        <div className={styles.actionsGrid}>
          <button className={styles.actionButton} onClick={() => navigate('/reports')}>
            📊 View My Activity
          </button>
          <button className={styles.actionButton} onClick={() => navigate('/settings')}>
            ⚙️ Account Settings
          </button>
          <button className={styles.actionButton} onClick={handleExportData}>
            📥 Export Profile Data
          </button>
          <button className={styles.actionButton} onClick={() => navigate('/reports')}>
            📈 View Reports
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
