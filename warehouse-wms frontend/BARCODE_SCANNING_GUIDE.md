# 📱 Barcode Scanning Guide

## ✅ Feature Added to Inward Page

### How It Works:

1. **Click "Enable Scanner" button** on Inward page
2. **Scan barcode** with USB scanner OR **type SKU manually**
3. **System auto-fills** product and rack
4. **Enter quantity** and other details
5. **Submit** to complete inward operation

---

## 🔧 Two Ways to Use:

### **Option 1: USB Barcode Scanner (Recommended)**

#### What You Need:
- USB Barcode Scanner ($30-$100)
- Examples:
  - Zebra DS2208
  - Honeywell Voyager 1200g
  - Symbol LS2208
  - Any generic USB scanner

#### How to Use:
1. Plug scanner into computer USB port
2. Go to Inward page
3. Click "Enable Scanner"
4. Point scanner at barcode
5. Press trigger
6. Scanner types SKU + Enter automatically
7. Product auto-fills!

#### Setup:
- No software needed
- Scanner acts like keyboard
- Works immediately after plugging in

---

### **Option 2: Manual SKU Entry (No Scanner)**

#### How to Use:
1. Go to Inward page
2. Click "Enable Scanner"
3. Type SKU manually (e.g., PC-0001)
4. Press Enter or click Search
5. Product auto-fills!

---

## 📊 Workflow Example:

```
Step 1: Receive goods at warehouse
  ↓
Step 2: Open Inward page
  ↓
Step 3: Click "Enable Scanner"
  ↓
Step 4: Scan product barcode
  ↓ (Scanner reads: PC-0001)
Step 5: System finds product "Paper Cup 450ml"
  ↓ Auto-fills:
  - Product: Paper Cup 450ml
  - Rack: A-01 (if assigned)
  ↓
Step 6: Enter quantity: 20
  ↓
Step 7: Select supplier
  ↓
Step 8: Enter GRN number
  ↓
Step 9: Click "Receive Goods"
  ↓
✅ Done! Stock updated
```

---

## 🎯 Benefits:

1. **Faster Operations** - No manual product selection
2. **Fewer Errors** - Barcode is always accurate
3. **Easy to Use** - Just point and scan
4. **Works with Existing SKUs** - Uses your current SKU system
5. **No Training Needed** - Simple interface

---

## 🏷️ Barcode Requirements:

### Your Current SKU Format:
- Paper Cups: `PC-0001`, `PC-0002`, etc.
- Pizza Boxes: `PB-0001`, `PB-0002`, etc.
- Lids: `LD-0001`, `LD-0002`, etc.

### Barcode Types Supported:
- Code 39
- Code 128
- EAN-13
- UPC-A
- QR Code

### How to Generate Barcodes:

#### Option 1: Online Generator (Free)
1. Go to: https://barcode.tec-it.com
2. Select "Code 128"
3. Enter SKU: PC-0001
4. Download barcode image
5. Print on labels

#### Option 2: Excel/Word
1. Install barcode font
2. Type SKU
3. Apply barcode font
4. Print

#### Option 3: Label Printer Software
- Zebra Designer
- BarTender
- NiceLabel

---

## 🖨️ Printing Barcode Labels:

### What You Need:
- Label printer (Zebra, Brother, Dymo)
- OR regular printer + label sheets

### Label Information:
```
┌─────────────────────┐
│  Paper Cup 450ml    │
│  ▐▌▐▌▐▌▐▌▐▌▐▌▐▌▐▌  │ ← Barcode
│     PC-0001         │
│  Rack: A-01         │
└─────────────────────┘
```

---

## 💡 Tips:

1. **Print barcodes on all products** when they arrive
2. **Stick labels on cartons** for easy scanning
3. **Keep scanner within reach** at receiving desk
4. **Test scanner** before busy periods
5. **Have backup** - manual entry always works

---

## 🔍 Troubleshooting:

### Scanner not working?
- Check USB connection
- Try different USB port
- Restart computer
- Test scanner in Notepad (should type when scanned)

### Product not found?
- Check SKU is correct
- Verify product exists in Products page
- Try typing SKU manually
- Check for typos in database

### Scanner types wrong characters?
- Scanner might need configuration
- Check scanner manual for "USB Keyboard" mode
- Some scanners need to be set to "English" layout

---

## 🚀 Future Enhancements:

1. **Camera Scanning** - Use phone camera to scan
2. **Batch Scanning** - Scan multiple items at once
3. **Voice Confirmation** - Audio feedback after scan
4. **Barcode Printing** - Generate labels from system
5. **Mobile App** - Scan with phone app

---

## 📦 Recommended Scanners:

### Budget ($30-50):
- Tera Wireless Barcode Scanner
- TaoTronics Barcode Scanner
- Inateck Barcode Scanner

### Professional ($100-200):
- Zebra DS2208
- Honeywell Voyager 1200g
- Symbol LS2208

### Wireless ($150-300):
- Zebra DS3608
- Honeywell Xenon 1900
- Datalogic Gryphon

---

## ✅ Current Implementation:

- ✅ USB Scanner Support
- ✅ Manual SKU Entry
- ✅ Auto Product Selection
- ✅ Auto Rack Selection
- ✅ Visual Feedback
- ✅ Error Handling
- ✅ Focus Management

---

## 📝 Next Steps:

1. **Buy a USB barcode scanner** (recommended)
2. **Print barcode labels** for your products
3. **Test scanning** on Inward page
4. **Train staff** on using scanner
5. **Enjoy faster operations!** 🎉
