# Error Handling Middleware - Testing Guide

## What Was Added

✅ Error Handling Middleware - catches all errors and returns standardized responses
✅ 404 Not Found handler - returns proper error for invalid routes
✅ AppError utility class - for controllers to throw structured errors

## Files Created/Modified

- Created: `middlewares/errorHandler.js` - centralized error handler
- Created: `utils/AppError.js` - error class for use in controllers
- Modified: `server.js` - added error handler and 404 handler

---

## How to Test

### 1. **Test 404 (Route Not Found)**

```bash
curl http://localhost:3000/api/invalid-route
```

**Expected Response:**

```json
{
  "success": false,
  "error": {
    "message": "Route not found"
  }
}
```

---

### 2. **Test Database Error (Optional - if controller uses AppError)**

Once controllers start using `AppError`, test like:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product"}'
```

---

### 3. **Test Server Still Running**

```bash
curl http://localhost:3000
```

**Expected Response:**

```
Warehouse WMS Running 🚀
```

---

## How Controllers Should Use This (Example)

In any controller file, import and use AppError:

```javascript
const AppError = require("../utils/AppError");

const getProduct = async (req, res, next) => {
  try {
    // ... your logic
    if (!product) {
      throw new AppError("Product not found", 404, "NotFoundError");
    }
    res.json(product);
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

---

## Error Response Format

All errors now return in this standard format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": null // (optional, for validation errors)
  }
}
```

---

## No Breaking Changes ✅

- Existing routes continue to work as before
- Controllers don't need immediate changes
- Errors are only standardized when thrown via AppError or caught by middleware
- Safe to implement and test gradually

---

## Next Steps (Optional)

1. Update existing controllers to use `AppError` for consistent error handling
2. Add request validation middleware to catch bad inputs early
3. Add logging middleware to track all requests
