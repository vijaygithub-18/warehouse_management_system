# Barcode Generation Feature - Test Guide

## Overview
The barcode generation feature allows you to create, print, and download barcodes for products using their SKU codes.

## Features
- ✅ Generate CODE128 barcodes from product SKU
- ✅ Display product name and SKU with barcode
- ✅ Print barcode labels
- ✅ Download barcode as PNG image
- ✅ Beautiful modal interface
- ✅ Dark mode support

## How to Test

### 1. Access Barcode Generator
1. Navigate to **Products** page
2. Find any product in the table
3. Click the **📊 Barcode** button in the Actions column

### 2. View Barcode
**Expected Results:**
- Modal opens with barcode generator
- Product name and SKU displayed at top
- Barcode generated from SKU code
- Barcode is scannable and readable

### 3. Print Barcode
**Steps:**
1. Click **🖨️ Print Barcode** button
2. Print preview window opens

**Expected Results:**
- New window opens with print-ready barcode
- Product info and barcode centered
- Border around barcode for cutting
- Print dialog appears automatically

### 4. Download Barcode
**Steps:**
1. Click **💾 Download PNG** button

**Expected Results:**
- PNG file downloads automatically
- Filename: `barcode-{SKU}.png`
- Image has white background
- Barcode is high quality and scannable

### 5. Test Different Products
**Steps:**
1. Generate barcodes for different products
2. Test with various SKU formats:
   - Short SKUs (e.g., "PC001")
   - Long SKUs (e.g., "PRODUCT-12345-XL")
   - SKUs with special characters

**Expected Results:**
- All SKU formats generate valid barcodes
- Barcodes are properly formatted
- No errors or crashes

### 6. Dark Mode Test
**Steps:**
1. Enable dark mode (🌙 button)
2. Open barcode generator

**Expected Results:**
- Modal has dark background
- Text is readable
- Barcode area stays white (for printing)
- Buttons are visible and styled

## Barcode Specifications
- **Format:** CODE128
- **Width:** 2px per bar
- **Height:** 100px
- **Font Size:** 16px
- **Margin:** 10px
- **Display Value:** Yes (shows SKU below barcode)

## Use Cases

### 1. Inventory Labels
- Print barcodes for new products
- Attach to product packaging
- Scan during inward/outward operations

### 2. Shelf Labels
- Print barcodes for rack locations
- Attach to warehouse shelves
- Quick product identification

### 3. Digital Records
- Download barcodes for documentation
- Include in product catalogs
- Share with suppliers/customers

## Troubleshooting

### Barcode Not Generating
- Check if SKU is valid
- Ensure SKU contains alphanumeric characters
- Try refreshing the page

### Print Not Working
- Check browser print permissions
- Ensure pop-ups are not blocked
- Try different browser

### Download Not Working
- Check browser download permissions
- Ensure sufficient disk space
- Try different browser

## Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (Not supported)

## Success Criteria
✅ Barcode generates instantly
✅ Barcode is scannable with standard scanners
✅ Print produces clean, professional labels
✅ Download creates high-quality PNG
✅ Works in both light and dark mode
✅ No errors in console
✅ Responsive on mobile devices
