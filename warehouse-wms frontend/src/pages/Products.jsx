import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import BarcodeGenerator from "../components/BarcodeGenerator";
import styles from "../styles/pages/Products.module.css";

function Products() {
  const location = useLocation();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [racks, setRacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [carton_quantity, setCartonQuantity] = useState("");
  const [minimum_stock, setMinimumStock] = useState("");
  const [rackId, setRackId] = useState("");

  const [searchSku, setSearchSku] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "";
  });
  const [filterRack, setFilterRack] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showBarcode, setShowBarcode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // loader functions defined before useEffect so they can be referenced safely
  const loadProducts = async () => {
    const res = await fetch("http://localhost:3000/api/products/all");
    const data = await res.json();
    setProducts(data);
  };

  const loadCategories = async () => {
    const res = await fetch("http://localhost:3000/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  const loadRacks = async () => {
    const res = await fetch("http://localhost:3000/api/racks/all");
    const data = await res.json();
    setRacks(data);
  };

  useEffect(() => {
    const init = async () => {
      await loadProducts();
      await loadCategories();
      await loadRacks();
    };
    init();
  }, [location.search]);

  const saveProduct = async () => {
    // Validation
    if (!sku || sku.trim() === "") {
      toast.error("Please enter SKU");
      return;
    }
    if (!name || name.trim() === "") {
      toast.error("Please enter product name");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (carton_quantity && carton_quantity <= 0) {
      toast.error("Carton quantity must be greater than 0");
      return;
    }
    if (minimum_stock && minimum_stock < 0) {
      toast.error("Minimum stock cannot be negative");
      return;
    }

    const token = localStorage.getItem("token");
    const url = editingId
      ? `http://localhost:3000/api/products/update/${editingId}`
      : "http://localhost:3000/api/products/add";

    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku,
        name,
        category,
        material,
        size,
        carton_quantity,
        minimum_stock,
        rack_id: rackId || null,
      }),
    });

    if (response.ok) {
      clearForm();
      loadProducts();
      setShowModal(false);
      toast.success(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!",
      );
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to save product");
    }
  };

  const editProduct = (p) => {
    setEditingId(p.id);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setMaterial(p.material);
    setSize(p.size);
    setCartonQuantity(p.carton_quantity);
    setMinimumStock(p.minimum_stock);
    setRackId(p.rack_id || "");
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3000/api/products/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      loadProducts();
      toast.success("Product deleted successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to delete product");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setSku("");
    setName("");
    setCategory("");
    setMaterial("");
    setSize("");
    setCartonQuantity("");
    setMinimumStock("");
    setRackId("");
  };

  const openAddModal = () => {
    clearForm();
    setShowModal(true);
  };

  const filteredProducts = products.filter((p) => {
    const skuMatch = p.sku?.toLowerCase().includes(searchSku.toLowerCase());
    const nameMatch = p.name?.toLowerCase().includes(searchName.toLowerCase());
    const categoryMatch = !filterCategory || p.category === filterCategory;
    const rackMatch = !filterRack || p.rack_id === parseInt(filterRack);
    return skuMatch && nameMatch && categoryMatch && rackMatch;
  });

  const clearFilters = () => {
    setSearchSku("");
    setSearchName("");
    setFilterCategory("");
    setFilterRack("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    searchSku,
    searchName,
    filterCategory,
    filterRack,
  ].filter((f) => f).length;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
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

  const openBarcodeGenerator = (product) => {
    setSelectedProduct(product);
    setShowBarcode(true);
  };

  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <h1 className={styles.title}>📦 Products Management</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      <div className={styles.searchCard}>
        <div className={styles.searchGrid}>
          <input
            className={styles.searchInput}
            placeholder="🔍 Search by SKU..."
            value={searchSku}
            onChange={(e) => setSearchSku(e.target.value)}
          />
          <input
            className={styles.searchInput}
            placeholder="🔍 Search by Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <select
            className={styles.searchInput}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={styles.searchInput}
            value={filterRack}
            onChange={(e) => setFilterRack(e.target.value)}
          >
            <option value="">All Racks</option>
            {racks.map((r) => (
              <option key={r.id} value={r.id}>
                {r.rack_code}
              </option>
            ))}
          </select>
        </div>
        {activeFiltersCount > 0 && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
              active
            </span>
            <button
              onClick={clearFilters}
              style={{
                padding: "0.5rem 1rem",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              ✕ Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Product List</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className={styles.resultCount}>
              {filteredProducts.length} products
            </span>
            <ExportButtons
              data={filteredProducts}
              filename="products"
              title="Products List"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Material</th>
                  <th>Size</th>
                  <th>Carton Qty</th>
                  <th>Min Stock</th>
                  <th>Rack</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.skuBadge}>{p.sku}</span>
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{p.category}</span>
                    </td>
                    <td>{p.material}</td>
                    <td>{p.size}</td>
                    <td>{p.carton_quantity}</td>
                    <td>{p.minimum_stock}</td>
                    <td>{p.rack_code || "—"}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.barcodeButton}
                          onClick={() => openBarcodeGenerator(p)}
                          title="Generate Barcode"
                        >
                          📊 Barcode
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => editProduct(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => deleteProduct(p.id)}
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
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>No products found</p>
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
                {editingId ? "Edit Product" : "Add New Product"}
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
                <label className={styles.label}>SKU *</label>
                <input
                  className={styles.input}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter SKU"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name *</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <select
                  className={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Material</label>
                <input
                  className={styles.input}
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Enter material"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Size</label>
                <input
                  className={styles.input}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Enter size"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Carton Quantity</label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  value={carton_quantity}
                  onChange={(e) => setCartonQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Minimum Stock</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  value={minimum_stock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                  placeholder="Enter minimum stock"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Rack Location</label>
                <select
                  className={styles.select}
                  value={rackId}
                  onChange={(e) => setRackId(e.target.value)}
                >
                  <option value="">Select Rack</option>
                  {racks.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rack_code}
                    </option>
                  ))}
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
              <button className={styles.saveButton} onClick={saveProduct}>
                {editingId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBarcode && selectedProduct && (
        <BarcodeGenerator
          value={selectedProduct.sku}
          product={selectedProduct}
          onClose={() => setShowBarcode(false)}
        />
      )}
    </div>
  );
}

export default Products;
