import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Orders.module.css";

function PurchaseOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: "",
    payment_terms: "Net 30",
    delivery_method: "Standard Delivery",
    notes: "",
    tax: 0,
    discount: 0,
    items: []
  });

  useEffect(() => {
    loadOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    const res = await fetch("http://localhost:3000/api/purchase-orders/all");
    const data = await res.json();
    setOrders(data);
  };

  const loadSuppliers = async () => {
    const res = await fetch("http://localhost:3000/api/suppliers/all");
    const data = await res.json();
    setSuppliers(data);
  };

  const loadProducts = async () => {
    const res = await fetch("http://localhost:3000/api/products/all");
    const data = await res.json();
    setProducts(data);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: "", rate: "" }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (qty * rate);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(formData.tax) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return subtotal + tax - discount;
  };

  const handleSubmit = async () => {
    if (!formData.supplier_id || formData.items.length === 0) {
      toast.error("Please select supplier and add at least one item");
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/purchase-orders/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      toast.success("Purchase order created successfully!");
      setShowModal(false);
      loadOrders();
      setFormData({
        supplier_id: "",
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: "",
        payment_terms: "Net 30",
        delivery_method: "Standard Delivery",
        notes: "",
        tax: 0,
        discount: 0,
        items: []
      });
    }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/purchase-orders/${id}/status`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    loadOrders();
  };

  const viewOrderDetails = async (orderId) => {
    const res = await fetch(`http://localhost:3000/api/purchase-orders/${orderId}`);
    const data = await res.json();
    setSelectedOrder(data);
    setShowDetailsModal(true);
  };

  const printInvoice = () => {
    window.print();
  };

  const deleteOrder = async (id, poNumber) => {
    if (!window.confirm(`Are you sure you want to delete order ${poNumber}?`)) return;
    
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/api/purchase-orders/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.ok) {
      toast.success("Order deleted successfully!");
      loadOrders();
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': '#6b7280',
      'Issued': '#3b82f6',
      'Received': '#10b981',
      'Cancelled': '#ef4444'
    };
    return <span style={{ background: colors[status] || '#6b7280', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600' }}>{status}</span>;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || o.status === filterStatus;
    
    const orderDate = new Date(o.order_date);
    const matchesDateFrom = !filterDateFrom || orderDate >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || orderDate <= new Date(filterDateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.orders}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🛍️ Purchase Orders</h1>
          <p className={styles.subtitle}>Manage supplier orders and procurement</p>
        </div>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + New Purchase Order
        </button>
      </div>

      <div className={styles.filterCard}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search orders..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select className={styles.filterSelect} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Issued">Issued</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className={styles.filterSelect}
          placeholder="From Date"
          value={filterDateFrom}
          onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
        />
        <input
          type="date"
          className={styles.filterSelect}
          placeholder="To Date"
          value={filterDateTo}
          onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className={styles.tableCard}>
        {filteredOrders.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong style={{cursor: 'pointer', color: '#3b82f6'}} onClick={() => viewOrderDetails(order.id)}>{order.po_number}</strong></td>
                  <td>{order.supplier_name}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{order.items_count} items</td>
                  <td><strong style={{color: '#10b981'}}>₹{parseFloat(order.total).toFixed(2)}</strong></td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <select className={styles.statusSelect} value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                        <option value="Draft">Draft</option>
                        <option value="Issued">Issued</option>
                        <option value="Received">Received</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => deleteOrder(order.id, order.po_number)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem'}}>🗑️</button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <p>No purchase orders found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Purchase Order</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Supplier *</label>
                <select value={formData.supplier_id} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Order Date *</label>
                <input type="date" value={formData.order_date} onChange={(e) => setFormData({...formData, order_date: e.target.value})} />
              </div>

              <div className={styles.formGroup}>
                <label>Expected Delivery</label>
                <input type="date" value={formData.expected_delivery_date} onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})} />
              </div>

              <div className={styles.formGroup}>
                <label>Payment Terms</label>
                <select value={formData.payment_terms} onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}>
                  <option>Net 30</option>
                  <option>Net 60</option>
                  <option>Due on Receipt</option>
                  <option>Prepaid</option>
                </select>
              </div>
            </div>

            <div className={styles.itemsSection}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3>Order Items</h3>
                <button className={styles.addItemButton} onClick={addItem}>+ Add Item</button>
              </div>

              <div className={styles.itemsHeader}>
                <span>Product</span>
                <span>Quantity</span>
                <span>Rate (₹)</span>
                <span>Amount (₹)</span>
                <span></span>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <select 
                    value={item.product_id} 
                    onChange={(e) => {
                      const product = products.find(p => p.id === parseInt(e.target.value));
                      updateItem(index, 'product_id', e.target.value);
                      if (product) updateItem(index, 'rate', 0);
                    }}
                    style={{flex: 2}}
                  >
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    style={{flex: 1}}
                  />
                  <input 
                    type="number" 
                    placeholder="Rate (₹)" 
                    value={item.rate} 
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    style={{flex: 1}}
                  />
                  <span style={{flex: 1, fontWeight: 'bold', color: '#10b981', textAlign: 'right', paddingRight: '0.5rem'}}>₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</span>
                  <button className={styles.removeButton} onClick={() => removeItem(index)}>×</button>
                </div>
              ))}
            </div>

            <div className={styles.totalsSection}>
              <div className={styles.totalRow}><span>Subtotal:</span><span>₹{calculateSubtotal().toFixed(2)}</span></div>
              <div className={styles.totalRow}>
                <span>Tax (₹):</span>
                <input type="number" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} placeholder="0.00" />
              </div>
              <div className={styles.totalRow}>
                <span>Discount (₹):</span>
                <input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="0.00" />
              </div>
              <div className={styles.totalRow} style={{fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #e5e7eb', paddingTop: '0.75rem', marginTop: '0.5rem'}}>
                <span>Total:</span><span style={{color: '#10b981'}}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveButton} onClick={handleSubmit}>Create Order</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className={styles.modal} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px'}}>
            <div className={styles.modalHeader}>
              <h2>Order Details - {selectedOrder.order.po_number}</h2>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button onClick={printInvoice} style={{padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'}}>🖨️ Print Invoice</button>
                <button className={styles.closeButton} onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
            </div>

            <div className="print-only" style={{marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem'}}>
              <h1 style={{margin: 0, fontSize: '1.8rem', color: '#1f2937'}}>PURCHASE ORDER</h1>
              <p style={{margin: '0.5rem 0', color: '#6b7280'}}>PO #: {selectedOrder.order.po_number}</p>
              <p style={{margin: '0.5rem 0', color: '#6b7280'}}>Date: {new Date(selectedOrder.order.order_date).toLocaleDateString()}</p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
              <div>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Supplier:</strong> {selectedOrder.order.supplier_name}</p>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Email:</strong> {selectedOrder.order.supplier_email}</p>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Contact:</strong> {selectedOrder.order.supplier_contact}</p>
              </div>
              <div>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Order Date:</strong> {new Date(selectedOrder.order.order_date).toLocaleDateString()}</p>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Expected Delivery:</strong> {selectedOrder.order.expected_delivery_date ? new Date(selectedOrder.order.expected_delivery_date).toLocaleDateString() : 'N/A'}</p>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}><strong>Status:</strong> {getStatusBadge(selectedOrder.order.status)}</p>
              </div>
            </div>

            <h3 style={{marginBottom: '1rem'}}>Order Items</h3>
            <table className={styles.table} style={{marginBottom: '1.5rem'}}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>₹{parseFloat(item.rate).toFixed(2)}</td>
                    <td><strong>₹{parseFloat(item.amount).toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{textAlign: 'right', borderTop: '2px solid #e5e7eb', paddingTop: '1rem'}}>
              <p style={{margin: '0.5rem 0'}}><strong>Subtotal:</strong> ₹{parseFloat(selectedOrder.order.subtotal).toFixed(2)}</p>
              <p style={{margin: '0.5rem 0'}}><strong>Tax:</strong> ₹{parseFloat(selectedOrder.order.tax).toFixed(2)}</p>
              <p style={{margin: '0.5rem 0'}}><strong>Discount:</strong> ₹{parseFloat(selectedOrder.order.discount).toFixed(2)}</p>
              <p style={{margin: '0.5rem 0', fontSize: '1.2rem', color: '#10b981'}}><strong>Total:</strong> ₹{parseFloat(selectedOrder.order.total).toFixed(2)}</p>
            </div>

            {selectedOrder.order.notes && (
              <div style={{marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px'}}>
                <strong>Notes:</strong>
                <p style={{margin: '0.5rem 0', color: '#6b7280'}}>{selectedOrder.order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrders;
