# Dark Mode Test Guide

## Test Setup
1. Start the application: `npm run dev`
2. Login to the application
3. Navigate to any page (Dashboard, Categories, Products, etc.)

## Test Cases

### Test 1: Dark Mode Toggle Button
**Steps:**
1. Look at the top-right corner of the Navbar
2. Find the theme toggle button (🌙 or ☀️)

**Expected Results:**
- Button is visible in the navbar
- Shows 🌙 (moon) icon in light mode
- Shows ☀️ (sun) icon in dark mode

### Test 2: Toggle to Dark Mode
**Steps:**
1. Click the theme toggle button (🌙)
2. Observe the page changes

**Expected Results:**
- Background changes to dark (#111827)
- Text changes to light colors
- Cards change to dark background (#1f2937)
- Inputs change to dark background (#374151)
- Icon changes to ☀️ (sun)
- Smooth transition animation (0.3s)

### Test 3: Toggle Back to Light Mode
**Steps:**
1. Click the theme toggle button (☀️)
2. Observe the page changes

**Expected Results:**
- Background changes to light (#f9fafb)
- Text changes to dark colors
- Cards change to white background
- Inputs change to white background
- Icon changes to 🌙 (moon)
- Smooth transition animation (0.3s)

### Test 4: Persistence Across Pages
**Steps:**
1. Enable dark mode
2. Navigate to different pages (Categories → Products → Dashboard)

**Expected Results:**
- Dark mode stays enabled across all pages
- No flickering or mode reset

### Test 5: Persistence After Refresh
**Steps:**
1. Enable dark mode
2. Refresh the page (F5 or Ctrl+R)

**Expected Results:**
- Dark mode is still enabled after refresh
- Preference is saved in localStorage

### Test 6: Categories Page Dark Mode
**Steps:**
1. Enable dark mode
2. Navigate to Categories page
3. Check all elements

**Expected Results:**
- Page background is dark
- Search card is dark
- Category cards are dark
- Modal (Add/Edit) is dark
- All text is readable
- Borders are visible
- Hover effects work properly

### Test 7: Modal in Dark Mode
**Steps:**
1. Enable dark mode
2. Click "Add Category" button
3. Check modal appearance

**Expected Results:**
- Modal background is dark
- Input fields are dark
- Labels are light colored
- Buttons are visible
- Close button works
- Form is fully functional

### Test 8: Export Buttons in Dark Mode
**Steps:**
1. Enable dark mode
2. Check export buttons appearance

**Expected Results:**
- Export buttons are visible
- Hover effects work
- Buttons are clickable
- Toast notifications are visible

## Browser Console Check
Run in browser console:
```javascript
// Check if dark mode is enabled
document.body.classList.contains('dark-mode')

// Check localStorage
localStorage.getItem('darkMode')

// Toggle programmatically
document.body.classList.toggle('dark-mode')
```

## Success Criteria
✅ Toggle button is visible and functional
✅ Dark mode applies to all elements
✅ Smooth transitions between modes
✅ Preference persists across pages
✅ Preference persists after refresh
✅ All text is readable in both modes
✅ All interactive elements work in both modes
✅ No visual glitches or flickering
