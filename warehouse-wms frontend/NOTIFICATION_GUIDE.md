# Notification System - How It Works

## 🔔 Notification Triggers

### 1. **Low Stock Alerts** (Currently Active)
- **Trigger**: When product stock < 50 units
- **Check Frequency**: Every 30 seconds (auto-refresh)
- **Example**: 
  ```
  Product: Laptop
  Current Stock: 45 units
  Threshold: 50 units
  → Notification: "Low Stock Alert - Laptop (SKU-001) - Only 45 units left"
  ```

### 2. **How to Test Notifications**

#### Option A: Reduce Stock Below 50
1. Go to **Products** page
2. Find any product
3. Click **Edit**
4. Change stock to a number **less than 50** (e.g., 30)
5. Click **Save**
6. Wait 30 seconds OR refresh page
7. Check bell icon 🔔 - you'll see notification!

#### Option B: Create Outward Operation
1. Go to **Outward** page
2. Select a product with stock > 50
3. Create outward operation to reduce stock below 50
4. Notification will appear automatically

#### Option C: Stock Adjustment
1. Go to **Stock Adjustments** page
2. Select product with stock > 50
3. Adjust stock to below 50 (reason: "Damage" or "Expired")
4. Notification appears

## 🎯 Notification Features

### Visual States:
- **Unread** (Blue background + blue left border)
  - New notifications you haven't clicked
  - Shows in badge count

- **Read** (Gray/faded)
  - Notifications you've clicked
  - Still visible but faded

- **Dismissed** (Hidden)
  - Notifications you clicked X on
  - Won't show again (saved in localStorage)

### Actions:
1. **Click notification** → Marks as read (fades it)
2. **Click X button** → Dismisses forever
3. **Click ✓ button** → Marks all as read
4. **Click 🗑️ button** → Clears all notifications

## 📊 Current Notification Logic

```javascript
// Checks every 30 seconds
loadNotifications() {
  1. Fetch all products from inventory
  2. Filter products where stock < 50
  3. Check if already dismissed (localStorage)
  4. Create notification for each low stock item
  5. Show in dropdown with unread badge
}
```

## 🔄 Real-Time Updates

- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: Click bell icon to reload
- **Persistent**: Dismissed items saved in browser

## 💡 To See Notifications Right Now:

### Quick Test:
1. Open browser console (F12)
2. Run this command:
```javascript
localStorage.removeItem('dismissedNotifications')
```
3. Refresh page
4. If any product has stock < 50, you'll see notifications!

### Or Create Low Stock:
1. Go to Products page
2. Edit any product
3. Set stock to 20 (or any number < 50)
4. Save
5. Look at bell icon 🔔 - notification appears!

## 📝 Notification Data Structure

```javascript
{
  id: 1,
  productId: 1,
  title: "Low Stock Alert",
  text: "Laptop (SKU-001) - Only 45 units left",
  time: "2:30 PM",
  type: "warning",
  read: false
}
```

## 🎨 Visual Example

```
Navbar:
  🔔 (with red badge "3")
  
Click bell:
  ┌─────────────────────────────────┐
  │ Notifications  3 new  [✓] [🗑️] │
  ├─────────────────────────────────┤
  │ 🔵 Low Stock Alert          [X] │
  │    Laptop (SKU-001)             │
  │    Only 45 units left           │
  │    2:30 PM                      │
  ├─────────────────────────────────┤
  │ 🔵 Low Stock Alert          [X] │
  │    Mouse (SKU-002)              │
  │    Only 30 units left           │
  │    2:28 PM                      │
  └─────────────────────────────────┘
```

## 🚀 Future Notification Types (Can Be Added)

1. **New Inward** - When new stock arrives
2. **Outward Completed** - When order is dispatched
3. **User Actions** - When admin adds/removes users
4. **System Alerts** - Database backup, errors
5. **Expiry Alerts** - Products near expiry date
6. **Reorder Alerts** - When to reorder stock

Would you like me to add any of these notification types?
