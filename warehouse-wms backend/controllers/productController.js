const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// Add Product
exports.addProduct = async (req, res) => {
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

    // Category prefix logic
    let prefix = "PR";
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
    else if (category === "Straws" || category === "Straws") prefix = "STR";
    else if (category === "PET Cups" || category === "PET Cups") prefix = "PET";
    else if (category === "Aluminium" || category === "Aluminium")
      prefix = "ALU";
    else if (category === "Napkins" || category === "Napkins") prefix = "NAP";
    else if (category === "Wrap Papers" || category === "Wrap Papers")
      prefix = "WP";

    // Find highest SKU number with same prefix
    const lastProduct = await pool.query(
      "SELECT sku FROM products WHERE sku LIKE $1 ORDER BY sku DESC LIMIT 1",
      [prefix + "-%"],
    );

    let nextNumber = 1;
    if (lastProduct.rows.length > 0) {
      const lastSku = lastProduct.rows[0].sku;
      const lastNumber = parseInt(lastSku.split("-")[1]);
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    const sku = prefix + "-" + String(nextNumber).padStart(4, "0");

    const result = await pool.query(
      `INSERT INTO products (sku, name, category, material, size, carton_quantity, minimum_stock, rack_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
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
    res.status(500).json({ error: "Error adding product" });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM products
      WHERE name ILIKE $1 OR sku ILIKE $1
    `,
      [`%${search}%`],
    );

    const result = await pool.query(
      `
      SELECT products.*, racks.rack_code
      FROM products
      LEFT JOIN racks ON products.rack_id = racks.id
      WHERE products.name ILIKE $1 OR products.sku ILIKE $1
      ORDER BY products.id ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${search}%`, limit, offset],
    );

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching products" });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
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
      `UPDATE products SET sku=$1, name=$2, category=$3, material=$4, size=$5, carton_quantity=$6, minimum_stock=$7, rack_id=$8 WHERE id=$9`,
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
    console.error(err);
    res.status(500).send("Error updating product");
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await pool.query(
      "SELECT name, sku FROM products WHERE id=$1",
      [id],
    );
    const productName = product.rows[0]?.name || "Unknown";
    const productSku = product.rows[0]?.sku || "Unknown";

    await pool.query("DELETE FROM products WHERE id=$1", [id]);

    res.json({ message: "Product Deleted" });

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
    console.error(err);
    res.status(500).json({ error: "Error deleting product" });
  }
};
