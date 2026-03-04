const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");
const { verifyToken } = require("./authRoutes");

// ➜ Add Product
router.post("/add", verifyToken, async (req, res) => {
  try {
    const {
      name,
      category,
      material,
      size,
      carton_quantity,
      minimum_stock,
      rack_id,
    } = req.body;

    // CATEGORY PREFIX LOGIC

    let prefix = "PR";

    console.log("Received category:", category);

    if (category === "Paper Cups" || category === "Paper Cup") prefix = "PC";
    else if (category === "Pizza Boxes" || category === "Pizza Box")
      prefix = "PB";
    else if (category === "Lids" || category === "Lid") prefix = "LD";
    else if (category === "Food Boxes" || category === "Food Box")
      prefix = "FB";
    else if (category === "Sipper Cups" || category === "Sipper Cup")
      prefix = "SP";
    else if (category === "Paper Bags" || category === "Paper Bag")
      prefix = "BG";
    else if (category === "Rice Straws" || category === "Rice Straw")
      prefix = "RS";
    else if (category === "Salad Bowls" || category === "Salad Bowls")
      prefix = "SB";
    else if (category === "Aluminium" || category === "Aluminium")
      prefix = "ALU";

    console.log("Using prefix:", prefix);

    // FIND HIGHEST SKU NUMBER WITH SAME PREFIX
    const lastProduct = await pool.query(
      "SELECT sku FROM products WHERE sku LIKE $1 ORDER BY sku DESC LIMIT 1",
      [prefix + "-%"],
    );

    let nextNumber = 1;

    if (lastProduct.rows.length > 0) {
      const lastSku = lastProduct.rows[0].sku;
      const lastNumber = parseInt(lastSku.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    const sku = prefix + "-" + String(nextNumber).padStart(4, "0");

    const result = await pool.query(
      `INSERT INTO products (sku, name, category, material, size, carton_quantity, minimum_stock, rack_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        sku,
        name,
        category,
        material,
        size,
        carton_quantity,
        minimum_stock,
        rack_id,
      ],
    );

    res.json({
      message: "Product Added Successfully",
      product: result.rows[0],
    });

    // Log activity
    await logActivity(
      req.user.id,
      req.user.username,
      "CREATE",
      "PRODUCT",
      result.rows[0].id,
      `Added product: ${name} (${sku})`,
      null,
    );
  } catch (error) {
    console.error(error);
    if (error.constraint === 'unique_product_sku') {
      return res.status(400).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Error adding product" });
  }
});

// ➜ Get All Products
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      products.*,
      racks.rack_code
      FROM products
      LEFT JOIN racks
      ON products.rack_id = racks.id
      ORDER BY products.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

// ➜ Check Stock Availability
router.post("/check-stock", async (req, res) => {
  try {
    const { items } = req.body; // items = [{product_id, quantity}]
    
    const stockIssues = [];
    
    for (const item of items) {
      const result = await pool.query(
        "SELECT id, name, sku, stock, minimum_stock FROM products WHERE id = $1",
        [item.product_id]
      );
      
      if (result.rows.length === 0) {
        stockIssues.push({
          product_id: item.product_id,
          issue: 'not_found',
          message: 'Product not found'
        });
        continue;
      }
      
      const product = result.rows[0];
      const requestedQty = parseInt(item.quantity);
      const availableStock = parseInt(product.stock);
      
      if (availableStock < requestedQty) {
        stockIssues.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          issue: 'insufficient',
          available: availableStock,
          requested: requestedQty,
          shortage: requestedQty - availableStock,
          message: `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQty}`
        });
      } else if (availableStock - requestedQty < product.minimum_stock) {
        stockIssues.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          issue: 'below_minimum',
          available: availableStock,
          requested: requestedQty,
          minimum_stock: product.minimum_stock,
          remaining: availableStock - requestedQty,
          message: `Warning: Stock will go below minimum level (${product.minimum_stock})`
        });
      }
    }
    
    res.json({
      valid: stockIssues.length === 0,
      issues: stockIssues
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking stock" });
  }
});

module.exports = router;

// ➜ UPDATE PRODUCT

router.put("/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id;

  const {
    sku,
    name,
    category,
    material,
    size,
    carton_quantity,
    minimum_stock,
    rack_id,
  } = req.body;

  try {
    await pool.query(
      `UPDATE products
       SET
       sku=$1,
       name=$2,
       category=$3,
       material=$4,
       size=$5,
       carton_quantity=$6,
       minimum_stock=$7,
       rack_id=$8
       WHERE id=$9`,
      [
        sku,
        name,
        category,
        material,
        size,
        carton_quantity,
        minimum_stock,
        rack_id,
        id,
      ],
    );

    res.json({ message: "Product Updated" });

    // Log activity
    await logActivity(
      req.user.id,
      req.user.username,
      "UPDATE",
      "PRODUCT",
      id,
      `Updated product: ${name} (${sku})`,
      null,
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating product");
  }
});
// ➜ DELETE PRODUCT

router.delete("/delete/:id", verifyToken, async (req, res) => {
  const id = req.params.id;

  try {
    // Check if product has inward records
    const inwardCheck = await pool.query(
      "SELECT COUNT(*) as count FROM inward WHERE product_id = $1",
      [id]
    );
    
    // Check if product has outward records
    const outwardCheck = await pool.query(
      "SELECT COUNT(*) as count FROM outward WHERE product_id = $1",
      [id]
    );
    
    const inwardCount = parseInt(inwardCheck.rows[0].count);
    const outwardCount = parseInt(outwardCheck.rows[0].count);
    
    if (inwardCount > 0 || outwardCount > 0) {
      return res.status(400).json({
        error: `Cannot delete product. It has ${inwardCount} inward and ${outwardCount} outward records. Please delete those records first.`
      });
    }

    // Get product name before deleting
    const product = await pool.query(
      "SELECT name, sku FROM products WHERE id=$1",
      [id],
    );
    const productName = product.rows[0]?.name || "Unknown";
    const productSku = product.rows[0]?.sku || "Unknown";

    await pool.query("DELETE FROM products WHERE id=$1", [id]);

    res.json({
      message: "Product Deleted",
    });

    // Log activity
    await logActivity(
      req.user.id,
      req.user.username,
      "DELETE",
      "PRODUCT",
      id,
      `Deleted product: ${productName} (${productSku})`,
      null,
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error deleting product" });
  }
});
