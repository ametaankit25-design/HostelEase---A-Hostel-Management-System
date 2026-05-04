import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Alert,
  CircularProgress, Chip, Avatar
} from "@mui/material";
import { ReportProblemOutlined, CheckCircleOutlined, HistoryOutlined } from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AddReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ title: "", description: "" });
  const [formErrors, setFormErrors] = useState({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadReports = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/student/${user.id}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setReports(data.data || []);
    } catch {
      setError("Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadReports();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/reports`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, title: form.title, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit report");

      setSuccess("Report submitted successfully.");
      setForm({ title: "", description: "" });
      loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight={800} mb={3}>Report an Issue</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Avatar sx={{ bgcolor: "#FFF3E0", color: "#E65100" }}>
            <ReportProblemOutlined />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>New Report</Typography>
            <Typography variant="caption" color="text.secondary">Submit maintenance issues or complaints</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={handleChange("title")}
            error={!!formErrors.title}
            helperText={formErrors.title}
            fullWidth size="small"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            error={!!formErrors.description}
            helperText={formErrors.description}
            multiline rows={4}
            fullWidth size="small"
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ mt: 1, py: 1.25, borderRadius: 2, bgcolor: "#1565C0", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#0D47A1" } }}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" fontWeight={800} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HistoryOutlined fontSize="small" /> Past Reports
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
      ) : reports.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
          <Typography color="text.secondary">You haven't submitted any reports yet.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reports.map((report) => (
            <Paper key={report._id} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Typography fontWeight={700} fontSize={16}>{report.title}</Typography>
                <Chip
                  label={report.status}
                  size="small"
                  icon={report.status === "Resolved" ? <CheckCircleOutlined fontSize="small" /> : undefined}
                  sx={{
                    fontWeight: 700, fontSize: 11,
                    bgcolor: report.status === "Resolved" ? "#E8F5E9" : report.status === "Pending" ? "#FFF3E0" : "#FFEBEE",
                    color: report.status === "Resolved" ? "#2E7D32" : report.status === "Pending" ? "#E65100" : "#C62828",
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}>
                {report.description}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Submitted on {new Date(report.createdAt).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AddReport;
