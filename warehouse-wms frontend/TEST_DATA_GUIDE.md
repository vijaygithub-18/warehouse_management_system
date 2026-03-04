# 🧪 Test Data Guide - Warehouse WMS

Complete test data for all modules with 10 records each. Follow this guide step-by-step to populate your system and verify all features are working correctly.

---

## 📋 Testing Order (Follow This Sequence)

1. **Categories** → 2. **Racks** → 3. **Suppliers** → 4. **Customers** → 5. **Products** → 6. **Inward** → 7. **Outward** → 8. **Purchase Orders** → 9. **Sales Orders** → 10. **Stock Adjustments**

---

## 1️⃣ Categories (10 Records)

**Purpose:** Product classification for inventory organization

| # | Name | Code | Description |
|---|------|------|-------------|
| 1 | Paper Cups | PC | Disposable paper cups for beverages |
| 2 | Pizza Boxes | PB | Corrugated pizza packaging boxes |
| 3 | Plastic Lids | PL | Plastic lids for cups and containers |
| 4 | Food Containers | FC | Takeaway food containers |
| 5 | Sipper Cups | SC | Cups with sipper lids |
| 6 | Paper Bags | BAG | Eco-friendly paper bags |
| 7 | Straws | STR | Plastic and paper straws |
| 8 | Salad Bowls | SB | Disposable salad bowls |
| 9 | Aluminium Foil | AF | Food-grade aluminium foil rolls |
| 10 | Napkins | NAP | Paper napkins and tissues |

**Test Points:**
- ✅ Add all 10 categories
- ✅ Search by name/code
- ✅ Edit a category
- ✅ Click on category card (should navigate to products filtered by category)
- ✅ Export to CSV
- ✅ Test dark mode

---

## 2️⃣ Racks (10 Records)

**Purpose:** Physical storage locations in warehouse

| # | Rack Code | Description |
|---|-----------|-------------|
| 1 | A-01 | Warehouse A, Section 1, Ground Floor |
| 2 | A-02 | Warehouse A, Section 2, Ground Floor |
| 3 | B-01 | Warehouse B, Section 1, First Floor |
| 4 | B-02 | Warehouse B, Section 2, First Floor |
| 5 | C-01 | Cold Storage, Section 1 |
| 6 | C-02 | Cold Storage, Section 2 |
| 7 | D-01 | Dry Storage, Section 1 |
| 8 | D-02 | Dry Storage, Section 2 |
| 9 | E-01 | Express Shipping Area |
| 10 | F-01 | Fragile Items Storage |

**Test Points:**
- ✅ Add all 10 racks
- ✅ Search by rack code
- ✅ Edit rack description
- ✅ Try to delete a rack (should fail if products assigned)
- ✅ Pagination test

---

## 3️⃣ Suppliers (10 Records)

**Purpose:** Vendor management for procurement

| # | Name | Contact | Email | Address |
|---|------|---------|-------|---------|
| 1 | Green Pack Industries | 9876543210 | sales@greenpack.com | 123 Industrial Area, Mumbai, MH 400001 |
| 2 | Eco Supplies Ltd | 9876543211 | info@ecosupplies.com | 456 Trade Center, Delhi, DL 110001 |
| 3 | Prime Packaging Co | 9876543212 | orders@primepack.com | 789 Business Park, Bangalore, KA 560001 |
| 4 | Quality Containers | 9876543213 | contact@qualitycon.com | 321 Export Zone, Chennai, TN 600001 |
| 5 | Swift Distributors | 9876543214 | support@swiftdist.com | 654 Logistics Hub, Pune, MH 411001 |
| 6 | Mega Supplies Inc | 9876543215 | sales@megasupplies.com | 987 Warehouse District, Hyderabad, TS 500001 |
| 7 | Royal Packaging | 9876543216 | info@royalpack.com | 147 Industrial Estate, Ahmedabad, GJ 380001 |
| 8 | Star Traders | 9876543217 | orders@startraders.com | 258 Commerce Street, Kolkata, WB 700001 |
| 9 | Elite Supplies | 9876543218 | contact@elitesupply.com | 369 Trade Avenue, Jaipur, RJ 302001 |
| 10 | Global Packaging | 9876543219 | sales@globalpack.com | 741 Export Plaza, Surat, GJ 395001 |

**Test Points:**
- ✅ Add all 10 suppliers
- ✅ Search by name/contact/email
- ✅ Filter by "Has Contact" / "No Contact"
- ✅ Edit supplier details
- ✅ Validate phone number (10-15 digits)
- ✅ Validate email format
- ✅ Export to CSV

---

## 4️⃣ Customers (10 Records)

**Purpose:** Client management for sales and orders

| # | Name | Contact | Email | Address |
|---|------|---------|-------|---------|
| 1 | Cafe Delight | 9123456780 | orders@cafedelight.com | Shop 12, MG Road, Mumbai, MH 400020 |
| 2 | Pizza Paradise | 9123456781 | manager@pizzaparadise.com | 45 Food Street, Delhi, DL 110015 |
| 3 | Quick Bites Restaurant | 9123456782 | contact@quickbites.com | 78 Restaurant Row, Bangalore, KA 560025 |
| 4 | The Food Court | 9123456783 | info@foodcourt.com | Mall 3rd Floor, Chennai, TN 600017 |
| 5 | Burger King Franchise | 9123456784 | franchise@burgerking.com | Highway Plaza, Pune, MH 411014 |
| 6 | Coffee House Chain | 9123456785 | orders@coffeehouse.com | 23 Coffee Lane, Hyderabad, TS 500034 |
| 7 | Fast Food Junction | 9123456786 | sales@fastfood.com | 56 Market Street, Ahmedabad, GJ 380009 |
| 8 | Royal Restaurant | 9123456787 | booking@royalrest.com | 89 Dining District, Kolkata, WB 700019 |
| 9 | Snack Shack | 9123456788 | info@snackshack.com | 34 Food Plaza, Jaipur, RJ 302016 |
| 10 | Tasty Treats Cafe | 9123456789 | contact@tastytreats.com | 67 Cafe Corner, Surat, GJ 395007 |

**Test Points:**
- ✅ Add all 10 customers
- ✅ Search functionality
- ✅ Filter by contact availability
- ✅ Edit customer information
- ✅ Validate contact and email
- ✅ Export to CSV

---

## 5️⃣ Products (10 Records)

**Purpose:** Inventory items with specifications

| # | SKU | Name | Category | Material | Size | Carton Qty | Min Stock | Rack |
|---|-----|------|----------|----------|------|------------|-----------|------|
| 1 | PC-0001 | Paper Cup 8oz | Paper Cups | Paper | 8oz | 1000 | 500 | A-01 |
| 2 | PC-0002 | Paper Cup 12oz | Paper Cups | Paper | 12oz | 1000 | 500 | A-01 |
| 3 | PB-0001 | Pizza Box 10inch | Pizza Boxes | Cardboard | 10" | 100 | 50 | A-02 |
| 4 | PB-0002 | Pizza Box 14inch | Pizza Boxes | Cardboard | 14" | 100 | 50 | A-02 |
| 5 | PL-0001 | Plastic Lid 8oz | Plastic Lids | Plastic | 8oz | 2000 | 1000 | B-01 |
| 6 | FC-0001 | Food Container 500ml | Food Containers | Plastic | 500ml | 500 | 250 | B-02 |
| 7 | SC-0001 | Sipper Cup 16oz | Sipper Cups | Plastic | 16oz | 500 | 200 | C-01 |
| 8 | BAG-0001 | Paper Bag Medium | Paper Bags | Paper | Medium | 500 | 200 | D-01 |
| 9 | STR-0001 | Plastic Straw 8inch | Straws | Plastic | 8" | 5000 | 2000 | E-01 |
| 10 | SB-0001 | Salad Bowl 750ml | Salad Bowls | Plastic | 750ml | 300 | 150 | F-01 |

**Test Points:**
- ✅ Add all 10 products
- ✅ Search by SKU and Name
- ✅ Filter by Category
- ✅ Filter by Rack
- ✅ Generate barcode for each product
- ✅ Print barcode labels
- ✅ Edit product details
- ✅ Export to CSV
- ✅ Verify rack assignment

---

## 6️⃣ Inward (Goods Receiving) - 10 Records

**Purpose:** Record incoming inventory from suppliers

| # | Product | Rack | Quantity | Supplier | GRN Number | Notes |
|---|---------|------|----------|----------|------------|-------|
| 1 | PC-0001 (Paper Cup 8oz) | A-01 | 50 | Green Pack Industries | GRN-2024-001 | Initial stock |
| 2 | PC-0002 (Paper Cup 12oz) | A-01 | 40 | Green Pack Industries | GRN-2024-002 | Bulk order |
| 3 | PB-0001 (Pizza Box 10inch) | A-02 | 30 | Eco Supplies Ltd | GRN-2024-003 | Regular supply |
| 4 | PB-0002 (Pizza Box 14inch) | A-02 | 25 | Eco Supplies Ltd | GRN-2024-004 | Monthly stock |
| 5 | PL-0001 (Plastic Lid 8oz) | B-01 | 60 | Prime Packaging Co | GRN-2024-005 | Urgent order |
| 6 | FC-0001 (Food Container 500ml) | B-02 | 35 | Quality Containers | GRN-2024-006 | New stock |
| 7 | SC-0001 (Sipper Cup 16oz) | C-01 | 20 | Swift Distributors | GRN-2024-007 | Special order |
| 8 | BAG-0001 (Paper Bag Medium) | D-01 | 45 | Mega Supplies Inc | GRN-2024-008 | Eco-friendly |
| 9 | STR-0001 (Plastic Straw 8inch) | E-01 | 100 | Royal Packaging | GRN-2024-009 | High demand |
| 10 | SB-0001 (Salad Bowl 750ml) | F-01 | 15 | Star Traders | GRN-2024-010 | Trial batch |

**Test Points:**
- ✅ Add all 10 inward entries
- ✅ Test barcode scanner (enable scanner and type SKU)
- ✅ Verify stock increases in inventory
- ✅ Filter by supplier
- ✅ Filter by date range
- ✅ Print inward report
- ✅ Check activity logs
- ✅ Verify email notifications (if configured)

---

## 7️⃣ Outward (Goods Dispatch) - 10 Records

**Purpose:** Record outgoing inventory to customers

| # | Product | Quantity | Customer | Invoice Number | Notes |
|---|---------|----------|----------|----------------|-------|
| 1 | PC-0001 (Paper Cup 8oz) | 10 | Cafe Delight | INV-2024-001 | Regular order |
| 2 | PC-0002 (Paper Cup 12oz) | 8 | Coffee House Chain | INV-2024-002 | Weekly supply |
| 3 | PB-0001 (Pizza Box 10inch) | 5 | Pizza Paradise | INV-2024-003 | Daily order |
| 4 | PB-0002 (Pizza Box 14inch) | 6 | Pizza Paradise | INV-2024-004 | Large pizzas |
| 5 | PL-0001 (Plastic Lid 8oz) | 12 | Quick Bites Restaurant | INV-2024-005 | Bulk order |
| 6 | FC-0001 (Food Container 500ml) | 7 | The Food Court | INV-2024-006 | Takeaway boxes |
| 7 | SC-0001 (Sipper Cup 16oz) | 4 | Burger King Franchise | INV-2024-007 | Beverage cups |
| 8 | BAG-0001 (Paper Bag Medium) | 9 | Fast Food Junction | INV-2024-008 | Packaging |
| 9 | STR-0001 (Plastic Straw 8inch) | 20 | Royal Restaurant | INV-2024-009 | Monthly supply |
| 10 | SB-0001 (Salad Bowl 750ml) | 3 | Snack Shack | INV-2024-010 | Salad orders |

**Test Points:**
- ✅ Add all 10 outward entries
- ✅ Test barcode scanner functionality
- ✅ Verify stock decreases in inventory
- ✅ Check for insufficient stock warnings
- ✅ Filter by customer
- ✅ Filter by date range
- ✅ Print dispatch report
- ✅ Verify low stock alerts

---

## 8️⃣ Purchase Orders - 5 Records

**Purpose:** Procurement orders to suppliers

### PO-001
- **Supplier:**   
- **Order Date:** Today's date
- **Expected Delivery:** +7 days
- **Payment Terms:** Net 30
- **Items:**
  1. PC-0001 (Paper Cup 8oz) - Qty: 100, Rate: ₹500
  2. PC-0002 (Paper Cup 12oz) - Qty: 80, Rate: ₹600
- **Tax:** ₹100
- **Discount:** ₹50
- **Status:** Draft → Issued

### PO-002
- **Supplier:** Eco Supplies Ltd
- **Order Date:** Today's date
- **Expected Delivery:** +10 days
- **Payment Terms:** Net 60
- **Items:**
  1. PB-0001 (Pizza Box 10inch) - Qty: 50, Rate: ₹800
  2. PB-0002 (Pizza Box 14inch) - Qty: 40, Rate: ₹1000
- **Tax:** ₹150
- **Discount:** ₹100
- **Status:** Issued

### PO-003
- **Supplier:** Prime Packaging Co
- **Order Date:** Today's date
- **Expected Delivery:** +5 days
- **Payment Terms:** Due on Receipt
- **Items:**
  1. PL-0001 (Plastic Lid 8oz) - Qty: 200, Rate: ₹300
  2. FC-0001 (Food Container 500ml) - Qty: 100, Rate: ₹700
- **Tax:** ₹200
- **Discount:** ₹0
- **Status:** Issued → Received

### PO-004
- **Supplier:** Quality Containers
- **Order Date:** Today's date
- **Expected Delivery:** +14 days
- **Payment Terms:** Prepaid
- **Items:**
  1. SC-0001 (Sipper Cup 16oz) - Qty: 60, Rate: ₹900
  2. BAG-0001 (Paper Bag Medium) - Qty: 150, Rate: ₹400
- **Tax:** ₹120
- **Discount:** ₹80
- **Status:** Draft

### PO-005
- **Supplier:** Swift Distributors
- **Order Date:** Today's date
- **Expected Delivery:** +3 days
- **Payment Terms:** Net 30
- **Items:**
  1. STR-0001 (Plastic Straw 8inch) - Qty: 500, Rate: ₹100
  2. SB-0001 (Salad Bowl 750ml) - Qty: 80, Rate: ₹850
- **Tax:** ₹80
- **Discount:** ₹50
- **Status:** Issued

**Test Points:**
- ✅ Create all 5 purchase orders
- ✅ Add multiple items per order
- ✅ Calculate subtotal, tax, discount, total automatically
- ✅ Change order status (Draft → Issued → Received)
- ✅ View order details
- ✅ Print purchase order
- ✅ Search by PO number
- ✅ Filter by status and date
- ✅ Delete an order (Draft status only)
- ✅ Export to CSV

---

## 9️⃣ Sales Orders - 5 Records

**Purpose:** Customer orders and sales tracking

### SO-001
- **Customer:**   Cafe Delight
- **Order Date:** Today's date
- **Expected Shipment:** +2 days
- **Payment Terms:** Net 30
- **Items:**
  1. PC-0001 (Paper Cup 8oz) - Qty: 20, Rate: ₹700
  2. PL-0001 (Plastic Lid 8oz) - Qty: 20, Rate: ₹400
- **Tax:** ₹80
- **Discount:** ₹20
- **Status:** Draft → Confirmed → Packed

### SO-002
- **Customer:** Pizza Paradise
- **Order Date:** Today's date
- **Expected Shipment:** +1 day
- **Payment Terms:** Due on Receipt
- **Items:**
  1. PB-0001 (Pizza Box 10inch) - Qty: 15, Rate: ₹1000
  2. PB-0002 (Pizza Box 14inch) - Qty: 10, Rate: ₹1200
- **Tax:** ₹100
- **Discount:** ₹50
- **Status:** Confirmed → Shipped

### SO-003
- **Customer:** Quick Bites Restaurant
- **Order Date:** Today's date
- **Expected Shipment:** +3 days
- **Payment Terms:** Net 60
- **Items:**
  1. FC-0001 (Food Container 500ml) - Qty: 25, Rate: ₹900
  2. BAG-0001 (Paper Bag Medium) - Qty: 30, Rate: ₹500
- **Tax:** ₹120
- **Discount:** ₹0
- **Status:** Confirmed

### SO-004
- **Customer:** The Food Court
- **Order Date:** Today's date
- **Expected Shipment:** +2 days
- **Payment Terms:** Prepaid
- **Items:**
  1. SC-0001 (Sipper Cup 16oz) - Qty: 10, Rate: ₹1100
  2. STR-0001 (Plastic Straw 8inch) - Qty: 50, Rate: ₹150
- **Tax:** ₹90
- **Discount:** ₹30
- **Status:** Confirmed → Packed → Shipped → Delivered

### SO-005
- **Customer:** Burger King Franchise
- **Order Date:** Today's date
- **Expected Shipment:** +5 days
- **Payment Terms:** Net 30
- **Items:**
  1. PC-0002 (Paper Cup 12oz) - Qty: 30, Rate: ₹800
  2. SB-0001 (Salad Bowl 750ml) - Qty: 8, Rate: ₹1000
- **Tax:** ₹110
- **Discount:** ₹40
- **Status:** Draft

**Test Points:**
- ✅ Create all 5 sales orders
- ✅ Stock validation (check available stock before order)
- ✅ Warning for below minimum stock
- ✅ Error for insufficient stock
- ✅ Calculate totals automatically
- ✅ Change order status through workflow
- ✅ View order details with customer info
- ✅ Print sales invoice
- ✅ Search and filter orders
- ✅ Export to CSV

---

## 🔟 Stock Adjustments - 5 Records

**Purpose:** Manual inventory corrections

| # | Product | Type | Quantity | Reason | Notes |
|---|---------|------|----------|--------|-------|
| 1 | PC-0001 | Damage | -5 | Damaged during handling | Water damage |
| 2 | PB-0001 | Loss | -3 | Missing items | Inventory audit |
| 3 | PL-0001 | Found | +10 | Found in storage | Misplaced items |
| 4 | FC-0001 | Damage | -2 | Quality issue | Manufacturing defect |
| 5 | STR-0001 | Adjustment | +15 | Recount correction | Physical count |

**Test Points:**
- ✅ Create adjustments for different types
- ✅ Verify stock updates (increase/decrease)
- ✅ Check activity logs
- ✅ Filter by adjustment type
- ✅ Export adjustment history

---

## 📊 Verification Checklist

After adding all test data, verify the following:

### Dashboard
- [ ] Total products count = 10
- [ ] Total categories count = 10
- [ ] Total customers count = 10
- [ ] Total suppliers count = 10
- [ ] Low stock alerts showing (if any below minimum)
- [ ] Recent activities displayed
- [ ] Stock value calculated correctly

### Inventory
- [ ] All products showing current stock
- [ ] Stock levels match (Inward - Outward ± Adjustments)
- [ ] Low stock items highlighted
- [ ] Filter and search working
- [ ] Export functionality

### Reports
- [ ] Inventory report accurate
- [ ] Sales report showing all orders
- [ ] Purchase report showing all POs
- [ ] Stock movement report
- [ ] Low stock report

### Activity Logs
- [ ] All actions logged (Add, Edit, Delete)
- [ ] User information captured
- [ ] Timestamps correct
- [ ] Filter by module working

### Email Notifications (if configured)
- [ ] Low stock alerts sent
- [ ] Order confirmations sent
- [ ] Stock updates notified

### Dark Mode
- [ ] All pages render correctly
- [ ] Text readable
- [ ] Colors appropriate
- [ ] Toggle working smoothly

### Export Features
- [ ] CSV export working for all modules
- [ ] Data complete and formatted
- [ ] File downloads successfully

### Barcode Scanning
- [ ] Scanner activates properly
- [ ] SKU search working
- [ ] Product auto-fills
- [ ] Barcode generation working
- [ ] Print labels functional

---

## 🎯 Testing Scenarios

### Scenario 1: Complete Order Fulfillment
1. Create Purchase Order (PO-006) for 100 units
2. Receive goods via Inward (GRN-2024-011)
3. Create Sales Order (SO-006) for 50 units
4. Dispatch goods via Outward (INV-2024-011)
5. Verify stock = 50 units remaining

### Scenario 2: Low Stock Alert
1. Set product minimum stock = 20
2. Dispatch until stock < 20
3. Check dashboard for alert
4. Verify email notification (if configured)
5. Create purchase order to restock

### Scenario 3: Stock Validation
1. Product has 10 units in stock
2. Try to create sales order for 15 units
3. Should show "Insufficient stock" error
4. Reduce order to 10 units
5. Order should process successfully

### Scenario 4: Multi-Item Order
1. Create sales order with 5 different products
2. Verify stock check for all items
3. Calculate total with tax and discount
4. Print invoice
5. Verify all items deducted from stock

### Scenario 5: Returns & Adjustments
1. Customer returns 5 damaged items
2. Create stock adjustment (Damage, -5)
3. Create inward entry for replacement (+5)
4. Verify stock levels correct
5. Check activity logs

---

## 💡 Tips for Testing

1. **Follow the sequence** - Categories → Racks → Suppliers → Customers → Products → Transactions
2. **Use realistic data** - Makes testing more meaningful
3. **Test validations** - Try invalid inputs to verify error handling
4. **Check relationships** - Ensure foreign keys work (e.g., product → category)
5. **Test edge cases** - Zero stock, negative quantities, duplicate SKUs
6. **Verify calculations** - Order totals, stock levels, reports
7. **Test filters** - Search, date ranges, status filters
8. **Export data** - Verify CSV exports are complete
9. **Print reports** - Check print layouts
10. **Dark mode** - Test all pages in both themes

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't add product | Ensure category and rack exist first |
| Inward fails | Check supplier and product exist |
| Outward fails | Verify sufficient stock available |
| Order creation fails | Check customer/supplier and products exist |
| Stock mismatch | Review activity logs for all transactions |
| Barcode not working | Ensure SKU is unique and correct format |
| Export empty | Check if data exists and filters applied |
| Email not sent | Verify email settings in Settings page |

---

## ✅ Success Criteria

Your system is working correctly if:

- ✅ All 10 records added successfully in each module
- ✅ Stock calculations are accurate
- ✅ Orders process without errors
- ✅ Reports show correct data
- ✅ Filters and search work properly
- ✅ Export functionality works
- ✅ Barcode scanning operational
- ✅ Activity logs capture all actions
- ✅ Dark mode renders correctly
- ✅ No console errors in browser

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify backend server is running (port 3000)
3. Check database connections
4. Review activity logs for error details
5. Ensure all migrations are run

---

**Happy Testing! 🚀**

*Last Updated: 2024*
