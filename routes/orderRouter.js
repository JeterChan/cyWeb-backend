const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET: checkout-step1 page
router.get('/step1', orderController.readCheckoutPage);
// POST: checkout-step2 page
router.post('/step2', orderController.getCheckoutStep2);
// POST: checkout-step3 page
router.post('/step3',orderController.getCheckoutStep3);
// POST: checkout-success page
router.post('/submit', orderController.getCheckoutSuccess);

module.exports = router;