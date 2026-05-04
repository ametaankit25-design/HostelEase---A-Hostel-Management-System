import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Chip, Avatar, IconButton,
  CircularProgress, Alert, Menu, MenuItem
} from "@mui/material";
import {
  Assessment, CheckCircleOutlined, ErrorOutlined,
  MoreVert, PendingActions
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setReports(data.data || []);
      else setError(data.message || "Failed to load reports");
    } catch {
      setError("Network error loading reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadReports();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedReportId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReportId(null);
  };

  const updateStatus = async (status) => {
    if (!selectedReportId) return;
    const idToUpdate = selectedReportId;
    handleMenuClose();
    setUpdating(idToUpdate);
    try {
      const res = await fetch(`${API}/api/reports/${idToUpdate}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r._id === idToUpdate ? { ...r, status } : r));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update status");
      }
    } catch {
      setError("Network error updating status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: "#F3E5F5", color: "#6A1B9A" }}>
          <Assessment />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>Student Reports</Typography>
          <Typography variant="body2" color="text.secondary">Review issues and complaints</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
        ) : reports.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No reports submitted yet.</Typography>
          </Box>
        ) : (
          reports.map((report) => (
            <Box
              key={report._id}
              sx={{
                p: 3, borderBottom: "1px solid", borderColor: "grey.100",
                "&:last-child": { borderBottom: "none" },
                "&:hover": { bgcolor: "grey.50" },
                transition: "background 0.2s ease"
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} fontSize={16} mb={0.5}>
                    {report.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1.5}>
                    By {report.studentId?.name || report.studentId?.username || "Unknown"} · {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
                    {report.description}
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    label={report.status}
                    size="small"
                    icon={report.status === "Resolved" ? <CheckCircleOutlined fontSize="small" /> : report.status === "Dismissed" ? <ErrorOutlined fontSize="small" /> : <PendingActions fontSize="small" />}
                    sx={{
                      fontWeight: 700, fontSize: 11,
                      bgcolor: report.status === "Resolved" ? "#E8F5E9" : report.status === "Pending" ? "#FFF3E0" : "#FFEBEE",
                      color: report.status === "Resolved" ? "#2E7D32" : report.status === "Pending" ? "#E65100" : "#C62828",
                    }}
                  />
                  {updating === report._id ? (
                    <CircularProgress size={24} sx={{ p: 0.5 }} />
                  ) : (
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, report._id)}>
                      <MoreVert />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* Status Update Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
        <MenuItem onClick={() => updateStatus("Pending")} sx={{ fontSize: 14 }}>Mark as Pending</MenuItem>
        <MenuItem onClick={() => updateStatus("Resolved")} sx={{ fontSize: 14, color: "success.main" }}>Mark as Resolved</MenuItem>
        <MenuItem onClick={() => updateStatus("Dismissed")} sx={{ fontSize: 14, color: "error.main" }}>Dismiss Report</MenuItem>
      </Menu>
    </Box>
  );
};

export default Reports;
