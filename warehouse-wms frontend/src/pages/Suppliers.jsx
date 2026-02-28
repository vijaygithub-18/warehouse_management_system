import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import styles from "../styles/pages/Suppliers.module.css";

function Suppliers() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterContact, setFilterContact] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    void loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    fetch("http://localhost:3000/api/suppliers/all")
      .then((res) => res.json())
      .then((data) => setSuppliers(data));
  };

  const saveSupplier = async () => {
    if (!name || name.trim() === "") {
      toast.error("Please enter supplier name");
      return;
    }
    if (contact) {
      const cleanContact = contact.replace(/[^0-9]/g, '');
      if (cleanContact.length < 10 || cleanContact.length > 15) {
        toast.error("Please enter a valid phone number (10-15 digits)");
        return;
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const url = editingId
      ? `http://localhost:3000/api/suppliers/${editingId}`
      : "http://localhost:3000/api/suppliers/add";

    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, contact, email, address }),
    });

    if (response.ok) {
      clearForm();
      loadSuppliers();
      setShowModal(false);
      toast.success(editingId ? "Supplier updated successfully!" : "Supplier added successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to save supplier");
    }
  };

  const editSupplier = (supplier) => {
    setEditingId(supplier.id);
    setName(supplier.name);
    setContact(supplier.contact || "");
    setEmail(supplier.email || "");
    setAddress(supplier.address || "");
    setShowModal(true);
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/suppliers/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      loadSuppliers();
      toast.success("Supplier deleted successfully!");
    } else {
      toast.error("Failed to delete supplier.");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setContact("");
    setEmail("");
    setAddress("");
  };

  const openAddModal = () => {
    clearForm();
    setShowModal(true);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContact = !filterContact || 
      (filterContact === "has" && s.contact) ||
      (filterContact === "no" && !s.contact);
    
    return matchesSearch && matchesContact;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.suppliers}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏭 Suppliers Management</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add New Supplier
        </button>
      </div>

      <div className={styles.searchCard}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search suppliers..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select 
          className={styles.filterSelect} 
          value={filterContact} 
          onChange={(e) => { setFilterContact(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Suppliers</option>
          <option value="has">Has Contact</option>
          <option value="no">No Contact</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Supplier List</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={styles.resultCount}>
              {filteredSuppliers.length} suppliers
            </span>
            <ExportButtons data={filteredSuppliers} filename="suppliers" title="Suppliers List" />
          </div>
        </div>

        {filteredSuppliers.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <span className={styles.idBadge}>#{supplier.id}</span>
                  </td>
                  <td>
                    <strong>{supplier.name}</strong>
                  </td>
                  <td>{supplier.contact || "—"}</td>
                  <td>{supplier.email || "—"}</td>
                  <td>{supplier.address || "—"}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => editSupplier(supplier)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteSupplier(supplier.id)}
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
              totalItems={filteredSuppliers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏭</div>
            <p className={styles.emptyText}>No suppliers found</p>
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
                {editingId ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Supplier Name *</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Number</label>
                <input
                  className={styles.input}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter contact number"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Address</label>
                <textarea
                  className={styles.textarea}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveButton} onClick={saveSupplier}>
                {editingId ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
