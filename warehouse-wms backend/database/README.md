# 📁 Database Folder - Professional Organization

## Structure

```
database/
├── migrations/           Database schema changes
│   ├── create-*.js      Table creation scripts
│   └── update-*.js      Table update/alter scripts
│
└── scripts/             Utility & testing scripts
    ├── check-*.js       Verification scripts
    └── test-*.js        Testing scripts
```

---

## 📋 Migrations (9 files)

### Create Tables
- `create-activity-logs-table.js` - Activity logging table
- `create-adjustments-table.js` - Stock adjustments table
- `create-customers-table.js` - Customers table
- `create-inventory-table.js` - Inventory tracking table
- `create-suppliers-table.js` - Suppliers table
- `create-users-table.js` - Users & authentication table

### Update Tables
- `update-inward-table.js` - Inward table modifications
- `update-outward-table.js` - Outward table modifications
- `update-users-table.js` - Users table modifications

---

## 🔧 Scripts (3 files)

### Verification Scripts
- `check-racks.js` - Verify racks table data
- `check-table.js` - General table verification

### Testing Scripts
- `test-api.js` - API endpoint testing

---

## 🚀 Usage

### Run Migrations
```bash
# Create tables
node database/migrations/create-users-table.js
node database/migrations/create-inventory-table.js

# Update tables
node database/migrations/update-users-table.js
```

### Run Scripts
```bash
# Check data
node database/scripts/check-racks.js
node database/scripts/check-table.js

# Test API
node database/scripts/test-api.js
```

---

## ✅ Benefits

- **Organized** - All database files in one place
- **Clear Purpose** - Migrations vs Scripts separation
- **Easy to Find** - Logical folder structure
- **Professional** - Industry standard organization
- **Maintainable** - Easy to add new migrations

---

**Clean and professional database management!** 🎉
