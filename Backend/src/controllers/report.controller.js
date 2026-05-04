const Report = require('../models/Report.model');

// POST /api/reports — Create a new report
const createReport = async (req, res) => {
  try {
    const { studentId, title, description } = req.body;

    if (!studentId || !title || !description) {
      return res.status(400).json({ success: false, message: 'studentId, title, and description are required.' });
    }

    const report = await Report.create({ studentId, title, description });
    res.status(201).json({ success: true, message: 'Report submitted successfully.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reports/student/:studentId — Get all reports for a specific student
const getReportsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const reports = await Report.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reports — Get all reports (for Warden)
const getAllReports = async (req, res) => {
  try {
    // Populate the student details. Using 'student' ref which usually maps to username/email
    const reports = await Report.find().populate('studentId', 'username name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reports/:id — Update a report's status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required (Pending, Resolved, Dismissed).' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.status(200).json({ success: true, message: 'Report status updated.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReport, getReportsByStudent, getAllReports, updateReportStatus };
