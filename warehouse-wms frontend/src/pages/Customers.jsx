import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import styles from "../styles/pages/Customers.module.css";

function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
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
    void loadCustomers();
  }, []);

  const loadCustomers = () => {
    fetch("http://localhost:3000/api/customers/all")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  };

  const saveCustomer = async () => {
    if (!name || name.trim() === "") {
      toast.error("Please enter customer name");
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
      ? `http://localhost:3000/api/customers/${editingId}`
      : "http://localhost:3000/api/customers/add";

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
      loadCustomers();
      setShowModal(false);
      toast.success(editingId ? "Customer updated successfully!" : "Customer added successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to save customer");
    }
  };

  const editCustomer = (customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setContact(customer.contact || "");
    setEmail(customer.email || "");
    setAddress(customer.address || "");
    setShowModal(true);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/customers/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      loadCustomers();
      toast.success("Customer deleted successfully!");
    } else {
      toast.error("Failed to delete customer.");
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

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContact = !filterContact || 
      (filterContact === "has" && c.contact) ||
      (filterContact === "no" && !c.contact);
    
    return matchesSearch && matchesContact;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.customers}>
      <div className={styles.header}>
        <h1 className={styles.title}>👥 Customers Management</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add New Customer
        </button>
      </div>

      <div className={styles.searchCard}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search customers..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select 
          className={styles.filterSelect} 
          value={filterContact} 
          onChange={(e) => { setFilterContact(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Customers</option>
          <option value="has">Has Contact</option>
          <option value="no">No Contact</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Customer List</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={styles.resultCount}>
              {filteredCustomers.length} customers
            </span>
            <ExportButtons data={filteredCustomers} filename="customers" title="Customers List" />
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
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
                {paginatedCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className={styles.idBadge}>#{customer.id}</span>
                  </td>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>{customer.contact || "—"}</td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.address || "—"}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => editCustomer(customer)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteCustomer(customer.id)}
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
              totalItems={filteredCustomers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <p className={styles.emptyText}>No customers found</p>
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
                {editingId ? "Edit Customer" : "Add New Customer"}
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
                <label className={styles.label}>Customer Name *</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter customer name"
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
              <button className={styles.saveButton} onClick={saveCustomer}>
                {editingId ? "Update Customer" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
