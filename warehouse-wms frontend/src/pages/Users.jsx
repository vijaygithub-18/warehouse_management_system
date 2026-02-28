import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Users.module.css";

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterRole, setFilterRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Check if user is admin
    if (currentUser.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }
    void loadUsers();
  }, []);

  const loadUsers = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/users/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => toast.error("Failed to load users"));
  };

  const saveUser = async () => {
    if (!username || username.trim() === "") {
      toast.error("Please enter username");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!editingId && (!password || password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (editingId && password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    const token = localStorage.getItem("token");
    const url = editingId
      ? `http://localhost:3000/api/users/${editingId}`
      : "http://localhost:3000/api/users/add";

    const body = editingId && !password
      ? { username, email, role }
      : { username, email, password, role };

    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      clearForm();
      loadUsers();
      setShowModal(false);
      toast.success(editingId ? "User updated successfully!" : "User added successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to save user");
    }
  };

  const editUser = (user) => {
    setEditingId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setShowModal(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.ok) {
      loadUsers();
      toast.success("User deleted successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to delete user");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
  };

  const openAddModal = () => {
    clearForm();
    setShowModal(true);
  };

  const getRoleBadgeClass = (userRole) => {
    if (userRole === "admin") return styles.roleAdmin;
    if (userRole === "staff") return styles.roleStaff;
    return styles.roleManager;
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.users}>
      <div className={styles.header}>
        <h1 className={styles.title}>👤 User Management</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add New User
        </button>
      </div>

      <div className={styles.searchCard}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search users by username or email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select 
          className={styles.filterSelect} 
          value={filterRole} 
          onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>User List</h3>
          <span className={styles.resultCount}>{filteredUsers.length} users</span>
        </div>

        {filteredUsers.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className={styles.idBadge}>#{user.id}</span>
                  </td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => editUser(user)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteUser(user.id)}
                        disabled={user.id === currentUser.id}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <p className={styles.emptyText}>No users found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit User" : "Add New User"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username *</label>
                <input
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Password {editingId ? "(leave blank to keep current)" : "*"}
                </label>
                <input
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Enter new password" : "Enter password"}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Role *</label>
                <select
                  className={styles.select}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveButton} onClick={saveUser}>
                {editingId ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
