import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import styles from "../styles/pages/Categories.module.css";

function Categories() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");

  // fetch helper must be defined before using in effect to satisfy linting
  async function loadCategories() {
    try {
      const response = await fetch("http://localhost:3000/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to load categories");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadCategories();
    };
    init();
  }, []);

  const addCategory = async () => {
    if (!name || name.trim() === "") {
      toast.error("Please enter category name");
      return;
    }
    if (!code || code.trim() === "") {
      toast.error("Please enter category code");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `http://localhost:3000/api/categories/${editingId}`
        : "http://localhost:3000/api/categories";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code, description }),
      });

      if (response.ok) {
        clearForm();
        loadCategories();
        setShowModal(false);
        toast.success(
          editingId
            ? "Category updated successfully!"
            : "Category added successfully!",
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save category. Check console for details.");
    }
  };

  const editCategory = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || "");
    setShowModal(true);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        loadCategories();
        toast.success("Category deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete category. Check console for details.");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
  };

  const openModal = () => {
    clearForm();
    setShowModal(true);
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";

    if (name.includes("cup")) return "☕";
    if (name.includes("pizza") || name.includes("box")) return "🍕";
    if (name.includes("lid")) return "🎯";
    if (name.includes("food")) return "🍔";
    if (name.includes("sipper")) return "🥤";
    if (name.includes("bag")) return "🛍️";
    if (name.includes("straw")) return "🥢";
    if (name.includes("salad") || name.includes("bowl")) return "🥗";
    if (
      name.includes("aluminium") ||
      name.includes("aluminum") ||
      name.includes("foil")
    )
      return "📦";
    if (name.includes("plate")) return "🍽️";
    if (name.includes("spoon") || name.includes("fork")) return "🍴";
    if (name.includes("napkin") || name.includes("tissue")) return "🧻";
    if (name.includes("container")) return "📦";

    return "🏷️"; // Default icon
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.categories}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏷️ Product Categories</h1>
        <button className={styles.addButton} onClick={openModal}>
          + Add Category
        </button>
      </div>

      <div className={styles.searchCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <input
            className={styles.searchInput}
            placeholder="🔍 Search categories by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <ExportButtons
            data={filteredCategories}
            filename="categories"
            title="Categories List"
          />
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <div className={styles.categoryContainer}>
          <div className={styles.grid}>
            {paginatedCategories.map((cat) => (
              <div
                key={cat.id}
                className={styles.categoryCard}
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                }
                style={{ cursor: "pointer" }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.categoryIcon}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        editCategory(cat);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(cat.id);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <span className={styles.categoryCode}>{cat.code}</span>
                {cat.description && (
                  <p className={styles.categoryDescription}>
                    {cat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏷️</div>
          <p className={styles.emptyText}>
            No categories yet. Create your first category!
          </p>
          <button className={styles.emptyButton} onClick={openModal}>
            + Add First Category
          </button>
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category Name *</label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Paper Cups"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category Code *</label>
              <input
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., PC"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the category..."
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveButton} onClick={addCategory}>
                {editingId ? "Update Category" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
