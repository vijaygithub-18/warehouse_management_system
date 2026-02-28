import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Racks.module.css";

function Racks() {
  const toast = useToast();
  const [racks, setRacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rackCode, setRackCode] = useState("");
  const [description, setDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    void loadRacks();
  }, []);

  const loadRacks = async () => {
    console.log("Loading racks...");
    const res = await fetch("http://localhost:3000/api/racks/all");
    const data = await res.json();
    console.log("Racks loaded:", data);
    setRacks([...data]);
  };

  const saveRack = async () => {
    if (!rackCode || rackCode.trim() === "") {
      toast.error("Please enter rack code");
      return;
    }

    const url = editingId
      ? `http://localhost:3000/api/racks/${editingId}`
      : "http://localhost:3000/api/racks/add";

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rack_code: rackCode, description }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        setShowModal(false);
        clearForm();
        await loadRacks();
        toast.success(editingId ? "Rack updated successfully!" : "Rack added successfully!");
      } else {
        toast.error(data.error || "Failed to save rack");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save rack. Check console for details.");
    }
  };

  const editRack = (rack) => {
    setEditingId(rack.id);
    setRackCode(rack.rack_code);
    setDescription(rack.description || "");
    setShowModal(true);
  };

  const deleteRack = async (id) => {
    if (!window.confirm("Delete this rack?")) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/racks/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      loadRacks();
      toast.success("Rack deleted successfully!");
    } else {
      toast.error("Failed to delete rack. It may be in use by products.");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setRackCode("");
    setDescription("");
  };

  const openAddModal = () => {
    clearForm();
    setShowModal(true);
  };

  const filteredRacks = racks.filter((r) =>
    r.rack_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRacks = filteredRacks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.racks}>
      <div className={styles.header}>
        <h1 className={styles.title}>🗄️ Rack Management</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add New Rack
        </button>
      </div>

      <div className={styles.searchCard}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search racks by code or description..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Rack Locations</h3>
          <span className={styles.resultCount}>{filteredRacks.length} racks</span>
        </div>

        {filteredRacks.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Rack Code</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRacks.map((rack) => (
                <tr key={rack.id}>
                  <td>
                    <span className={styles.idBadge}>#{rack.id}</span>
                  </td>
                  <td>
                    <strong className={styles.rackCode}>{rack.rack_code}</strong>
                  </td>
                  <td>{rack.description || "—"}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => editRack(rack)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteRack(rack.id)}
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
              totalItems={filteredRacks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗄️</div>
            <p className={styles.emptyText}>No racks found</p>
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
                {editingId ? "Edit Rack" : "Add New Rack"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rack Code *</label>
              <input
                className={styles.input}
                value={rackCode}
                onChange={(e) => setRackCode(e.target.value)}
                placeholder="e.g., A-01, B-02"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <input
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Warehouse A, Section 1"
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveButton} onClick={saveRack}>
                {editingId ? "Update Rack" : "Add Rack"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Racks;
