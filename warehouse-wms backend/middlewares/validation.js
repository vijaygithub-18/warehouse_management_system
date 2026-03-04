const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('carton_quantity').isInt({ min: 1 }).withMessage('Carton quantity must be positive'),
  body('minimum_stock').isInt({ min: 0 }).withMessage('Minimum stock must be non-negative'),
  validate
];

const adjustmentValidation = [
  body('product_id').isInt().withMessage('Valid product ID required'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  validate
];

const inwardValidation = [
  body('product_id').isInt().withMessage('Valid product ID required'),
  body('quantity_cartons').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('rack_id').isInt().withMessage('Valid rack ID required'),
  body('supplier_id').isInt().withMessage('Valid supplier ID required'),
  body('grn').trim().notEmpty().withMessage('GRN is required'),
  validate
];

const outwardValidation = [
  body('product_id').isInt().withMessage('Valid product ID required'),
  body('quantity_cartons').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('customer_id').isInt().withMessage('Valid customer ID required'),
  body('invoice').trim().notEmpty().withMessage('Invoice is required'),
  validate
];

module.exports = {
  validate,
  productValidation,
  adjustmentValidation,
  inwardValidation,
  outwardValidation
};
