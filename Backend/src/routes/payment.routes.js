const express = require('express');
const router = express.Router();
const {
  addPayment,
  getAllPayments,
  getPaymentsByStudent,
  updatePaymentStatus,
  deletePayment,
  sendPaymentReminder,
} = require('../controllers/payment.controller');

router.get('/all',                getAllPayments);         // warden: all payments
router.get('/student/:studentId', getPaymentsByStudent);  // student: own payments
router.get('/:studentId',         getPaymentsByStudent);  // legacy compat
router.post('/',                  addPayment);
router.patch('/:id/status',       updatePaymentStatus);   // warden: toggle status
router.delete('/:id',             deletePayment);          // warden: delete record
router.post('/:id/remind',        sendPaymentReminder);    // warden: send email reminder

module.exports = router;
