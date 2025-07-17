/**
 * @swagger
 * tags:
 *   name: Order
 *   description: 訂單與結帳相關 API
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/personal-info', orderController.getCheckoutPage);
router.post('/personal-info', orderController.postPersonalInfo);
router.get('/address', orderController.getCheckoutStep2);
router.post('/address', orderController.postCheckoutStep2);
router.get('/address', orderController.getCheckoutStep2);
router.post('/address', orderController.postCheckoutStep2);
router.get('/payment', orderController.getCheckoutStep3);
router.post('/payment',orderController.postCheckoutStep3);
router.get('/confirmation', orderController.postCheckoutConfirmation);
router.post('/place-order', orderController.getCheckoutSuccess);
router.get('/history', orderController.getOrderhistory);
router.get('/:orderNumber', orderController.getOrderDetail);

module.exports = router;