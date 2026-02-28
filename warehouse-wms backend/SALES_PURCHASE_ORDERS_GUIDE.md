# 📦 Sales & Purchase Orders - User Guide

## 🎯 Overview

This system automatically manages inventory stock based on order status changes:
- **Sales Orders**: Stock reduces when orders are shipped/delivered
- **Purchase Orders**: Stock increases when orders are received
- **View Details**: Click order numbers to see complete order information
- **Delete Orders**: Remove unwanted orders with confirmation

---

## ✅ Features Implemented

### 1. 📋 View Order Details
- Click on any **blue order number** (e.g., SO-00001, PO-00001)
- Modal opens showing:
  - Customer/Supplier information
  - All order items with quantities and prices
  - Financial breakdown (subtotal, tax, discount, total)
  - Order notes

### 2. 🗑️ Delete Orders
- Click the **🗑️ trash button** in Actions column
- Confirmation dialog prevents accidental deletions
- Order is permanently removed from system

### 3. 📦 Automatic Stock Integration

#### Sales Orders:
- **Draft/Confirmed/Packed**: No stock change
- **Shipped/Delivered**: Stock automatically REDUCES by order quantity
- **Cancelled** (after shipping): Stock RESTORES

#### Purchase Orders:
- **Draft/Issued**: No stock change
- **Received**: Stock automatically INCREASES by order quantity
- **Cancelled** (after receiving): Stock REDUCES back

---

## 🚀 How to Use

### Creating a Sales Order:
1. Go to **Sales Orders** page
2. Click **+ New Sales Order**
3. Fill in customer details and order date
4. Add items (product, quantity, rate)
5. Add tax/discount if needed
6. Click **Create Order**
7. Order created with status "Confirmed"

### Shipping a Sales Order:
1. Find the order in the list
2. Change status dropdown to **"Shipped"**
3. ✅ Stock automatically reduces!
4. Go to **Inventory** page and press **F5** to see updated stock

### Creating a Purchase Order:
1. Go to **Purchase Orders** page
2. Click **+ New Purchase Order**
3. Fill in supplier details and order date
4. Add items (product, quantity, rate)
5. Add tax/discount if needed
6. Click **Create Order**
7. Order created with status "Issued"

### Receiving a Purchase Order:
1. Find the order in the list
2. Change status dropdown to **"Received"**
3. ✅ Stock automatically increases!
4. Go to **Inventory** page and press **F5** to see updated stock

---

## 📊 Checking Stock Changes

### Method 1: Inventory Page (UI)
1. Go to **Inventory** page
2. Press **F5** to refresh
3. Check the "Current Stock" column

### Method 2: Database Check (Terminal)
```bash
cd "warehouse-wms backend"
node check-stock.js
```
This shows real-time stock values from database.

---

## 🔍 Backend Logs

When you change order status, the backend terminal shows:
```
🔄 Updating Sales Order #2 to status: Shipped
📋 Old status: Confirmed
✅ Status updated in database
📦 Reducing stock for shipped/delivered order...
📦 Found 1 items to process
  - Reducing product #12 by 10 units
  ✅ New stock: 90
✅ Transaction committed successfully
```

**Emoji Guide:**
- 🔄 = Status update started
- 📋 = Old status detected
- 📦 = Stock operation in progress
- ✅ = Action completed successfully
- ❌ = Error occurred

---

## 📝 Example Workflow

### Scenario: Selling 10 Laptops

**Initial Stock**: Laptop = 100 units

1. **Create Sales Order**
   - Product: Laptop
   - Quantity: 10
   - Status: Confirmed
   - Stock: 100 (no change)

2. **Ship the Order**
   - Change status to "Shipped"
   - Stock: 90 (reduced by 10) ✅

3. **Customer Returns Order**
   - Change status to "Cancelled"
   - Stock: 100 (restored) ✅

### Scenario: Purchasing 50 Laptops

**Current Stock**: Laptop = 100 units

1. **Create Purchase Order**
   - Product: Laptop
   - Quantity: 50
   - Status: Issued
   - Stock: 100 (no change)

2. **Receive the Order**
   - Change status to "Received"
   - Stock: 150 (increased by 50) ✅

---

## ⚠️ Important Notes

1. **Stock updates only happen once per status change**
   - Changing "Shipped" to "Delivered" won't reduce stock again
   - System tracks previous status to prevent duplicates

2. **Refresh Inventory page after status changes**
   - Press **F5** on Inventory page to see updated stock
   - Stock changes happen immediately in database

3. **Deleting orders does NOT restore stock**
   - If order was shipped/received, stock remains changed
   - Use "Cancelled" status instead to restore stock

4. **Backend must be running**
   - Stock integration requires backend server to be active
   - Watch backend terminal for confirmation logs

---

## 🛠️ Troubleshooting

### Stock not changing?

**Check 1: Backend Logs**
- Do you see emoji logs (🔄 📦 ✅) when changing status?
- **NO** → Restart backend server: `node server.js`

**Check 2: Database**
- Run `node check-stock.js` to verify database values
- If database changed but UI didn't → Press F5 on Inventory page

**Check 3: Order Status**
- Sales Orders: Only "Shipped" or "Delivered" reduce stock
- Purchase Orders: Only "Received" increases stock

### View Details not working?
- Order number should be blue and clickable
- If not blue → Hard refresh browser (Ctrl+Shift+R)

### Delete button not working?
- Make sure you're logged in
- Check if token is valid (try logout and login again)

---

## 📂 Technical Details

### Database Tables:
- `sales_orders` - Sales order headers
- `sales_order_items` - Sales order line items
- `purchase_orders` - Purchase order headers
- `purchase_order_items` - Purchase order line items
- `products` - Product master with stock column

### Backend Files:
- `controllers/salesOrderController.js` - Sales order logic
- `controllers/purchaseOrderController.js` - Purchase order logic
- `routes/salesOrderRoutes.js` - Sales order API routes
- `routes/purchaseOrderRoutes.js` - Purchase order API routes
- `check-stock.js` - Stock verification script

### Frontend Files:
- `src/pages/SalesOrders.jsx` - Sales orders page
- `src/pages/PurchaseOrders.jsx` - Purchase orders page
- `src/pages/Inventory.jsx` - Stock overview page
- `src/styles/pages/Orders.module.css` - Order pages styling

---

## 🎉 Summary

✅ **Automatic Stock Management**: No manual stock adjustments needed  
✅ **Order Details View**: Complete order information in modal  
✅ **Safe Deletion**: Confirmation dialog prevents accidents  
✅ **Real-time Updates**: Stock changes immediately in database  
✅ **Audit Trail**: Backend logs show all stock operations  
✅ **Error Prevention**: Duplicate stock updates prevented  

---

## 📞 Support

If you encounter any issues:
1. Check backend terminal for error messages
2. Run `node check-stock.js` to verify database
3. Check browser console (F12) for frontend errors
4. Ensure backend server is running

---

**Last Updated**: January 2025  
**Version**: 1.0
