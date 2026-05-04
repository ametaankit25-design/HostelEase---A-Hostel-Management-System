const Payment = require('../models/Payment.model');
const Student = require('../models/Student.model');
const sendEmail = require('../utils/sendEmail');

// POST /api/payments — Record a payment
const addPayment = async (req, res) => {
  try {
    const { studentId, amount, status, date } = req.body;

    if (!studentId || !amount) {
      return res.status(400).json({ success: false, message: 'studentId and amount are required.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const payment = await Payment.create({ studentId, amount, status, date });
    res.status(201).json({ success: true, message: 'Payment recorded successfully.', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/all — Get ALL payments (warden view) with student info
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('studentId', 'name email course roomId')
      .sort({ date: -1 });

    const totalPaid    = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const totalUnpaid  = payments.filter(p => p.status === 'Unpaid').reduce((s, p) => s + p.amount, 0);
    const paidCount    = payments.filter(p => p.status === 'Paid').length;
    const unpaidCount  = payments.filter(p => p.status === 'Unpaid').length;

    res.status(200).json({
      success: true,
      summary: { totalPayments: payments.length, totalPaid, totalUnpaid, paidCount, unpaidCount },
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/student/:studentId — Get payments for one student
const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    let student;
    if (studentId.includes('@')) {
      student = await Student.findOne({ email: studentId }, 'name email course');
    } else {
      student = await Student.findById(studentId, 'name email course');
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const payments = await Payment.find({ studentId: student._id }).sort({ date: -1 });

    const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const totalDues = payments.filter(p => p.status === 'Unpaid').reduce((s, p) => s + p.amount, 0);

    res.status(200).json({
      success: true,
      student,
      summary: { totalPayments: payments.length, totalPaid, pendingDues: totalDues },
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/payments/:id/status — Toggle payment status (warden)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Paid', 'Unpaid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Paid or Unpaid.' });
    }

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    res.status(200).json({ success: true, message: 'Status updated.', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/payments/:id — Delete a payment record (warden)
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.status(200).json({ success: true, message: 'Payment deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/:id/remind — Send due fees reminder email (warden)
const sendPaymentReminder = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('studentId', 'name email');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    
    if (payment.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Payment is already marked as Paid.' });
    }

    const student = payment.studentId;
    if (!student || !student.email) {
      return res.status(400).json({ success: false, message: 'Student email not found.' });
    }

    const formattedAmount = `₹${payment.amount.toLocaleString()}`;
    const formattedDate = new Date(payment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const emailSent = await sendEmail({
      to: student.email,
      subject: `Hostel Fee Reminder - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #C62828;">Hostel Fee Payment Reminder</h2>
          <p>Dear <strong>${student.name}</strong>,</p>
          <p>This is a gentle reminder that you have pending hostel fees that require your attention.</p>
          
          <div style="background-color: #FFEBEE; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FFCDD2;">
            <h3 style="margin-top: 0; color: #C62828;">Due Details</h3>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${formattedAmount}</p>
            <p style="margin: 5px 0;"><strong>Original Due Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #C62828; font-weight: bold;">Unpaid</span></p>
          </div>

          <p>Please clear your dues as soon as possible to avoid any late fees or disruptions to your hostel services.</p>
          <p>If you have already made this payment, please contact the warden office to update your records.</p>
          <br/>
          <p>Best regards,<br/><strong>HostelEase Warden</strong></p>
        </div>
      `,
    });

    if (emailSent) {
      res.status(200).json({ success: true, message: 'Reminder email sent successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addPayment, getAllPayments, getPaymentsByStudent, updatePaymentStatus, deletePayment, sendPaymentReminder };
