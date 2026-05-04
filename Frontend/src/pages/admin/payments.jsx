import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, InputAdornment, IconButton, Tooltip,
  Autocomplete, Snackbar, Skeleton, Divider,
} from "@mui/material";
import {
  PaymentOutlined, CheckCircleOutlined, ErrorOutlined,
  AddOutlined, DeleteOutlined, SwapHorizOutlined,
  SearchOutlined, FilterListOutlined, PeopleAltOutlined,
  CurrencyRupeeOutlined, CloseOutlined, AccountBalanceWallet,
  EmailOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

// ── Summary Stat Card ──────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon, delay = 0 }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100",
      flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 2,
      animation: "fadeSlideUp 0.4s ease both", animationDelay: `${delay}ms`,
      "@keyframes fadeSlideUp": {
        from: { opacity: 0, transform: "translateY(14px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
      transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
    }}
  >
    <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10 }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>{value}</Typography>
    </Box>
  </Paper>
);

// ── Add Payment Dialog ─────────────────────────────────────────
const AddPaymentDialog = ({ open, onClose, students, onAdded }) => {
  const [form, setForm] = useState({ studentId: null, amount: "", status: "Paid", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const reset = () => { setForm({ studentId: null, amount: "", status: "Paid", date: new Date().toISOString().slice(0, 10) }); setErr(""); };

  const handleSubmit = async () => {
    if (!form.studentId || !form.amount) { setErr("Student and amount are required."); return; }
    if (isNaN(form.amount) || Number(form.amount) <= 0) { setErr("Enter a valid amount."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/api/payments`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: form.studentId._id, amount: Number(form.amount), status: form.status, date: form.date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onAdded(data.data);
      reset(); onClose();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <AddOutlined sx={{ color: "#1E3A8A" }} /> Add Payment Record
        <IconButton onClick={() => { reset(); onClose(); }} size="small" sx={{ ml: "auto" }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {err && <Alert severity="error" sx={{ borderRadius: 2 }}>{err}</Alert>}

        <Autocomplete
          options={students}
          getOptionLabel={(s) => `${s.name} — ${s.email}`}
          value={form.studentId}
          onChange={(_, val) => setForm(f => ({ ...f, studentId: val }))}
          renderInput={(params) => (
            <TextField {...params} label="Select Student" required
              InputProps={{ ...params.InputProps, startAdornment: <><PeopleAltOutlined sx={{ color: "text.disabled", mr: 1, fontSize: 18 }} />{params.InputProps?.startAdornment}</> }}
            />
          )}
          renderOption={(props, s) => (
            <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: "#E3F2FD", color: "#1565C0", fontSize: 12, fontWeight: 700 }}>{s.name?.[0]?.toUpperCase()}</Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                <Typography variant="caption" color="text.secondary">{s.course} · {s.email}</Typography>
              </Box>
            </Box>
          )}
        />

        <TextField
          label="Amount (₹)" type="number" required
          value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeOutlined sx={{ fontSize: 18 }} /></InputAdornment> }}
        />

        <TextField
          select label="Status"
          value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <MenuItem value="Paid">✅ Paid</MenuItem>
          <MenuItem value="Unpaid">⏳ Unpaid</MenuItem>
        </TextField>

        <TextField
          label="Date" type="date"
          value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={() => { reset(); onClose(); }} sx={{ textTransform: "none", color: "text.secondary" }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, bgcolor: "#1E3A8A", "&:hover": { bgcolor: "#1e40af" } }}>
          {loading ? "Saving…" : "Add Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ─────────────────────────────────────────────
const WardenPayments = () => {
  const [payments,  setPayments]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("All");    // All | Paid | Unpaid
  const [search,    setSearch]    = useState("");
  const [addOpen,   setAddOpen]   = useState(false);
  const [toast,     setToast]     = useState({ open: false, msg: "", sev: "success" });

  // ── Fetch all payments ──
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/payments/all`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayments(data.data || []);
      setSummary(data.summary || null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  // ── Fetch students for add-payment dropdown ──
  const fetchStudents = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/students`, { credentials: "include" });
      const data = await res.json();
      setStudents(data.data || []);
    } catch { /* ignore error */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPayments();
      fetchStudents();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchPayments, fetchStudents]);

  // ── Toggle paid/unpaid ──
  const handleToggleStatus = async (payment) => {
    const newStatus = payment.status === "Paid" ? "Unpaid" : "Paid";
    try {
      const res = await fetch(`${API}/api/payments/${payment._id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, status: newStatus } : p));
      // recompute summary
      const updated = payments.map(p => p._id === payment._id ? { ...p, status: newStatus } : p);
      const tp = updated.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
      const tu = updated.filter(p => p.status === "Unpaid").reduce((s, p) => s + p.amount, 0);
      setSummary(prev => ({ ...prev, totalPaid: tp, totalUnpaid: tu, paidCount: updated.filter(p=>p.status==="Paid").length, unpaidCount: updated.filter(p=>p.status==="Unpaid").length }));
      setToast({ open: true, msg: `Marked as ${newStatus}`, sev: "success" });
    } catch { setToast({ open: true, msg: "Failed to update status", sev: "error" }); }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      const res = await fetch(`${API}/api/payments/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setPayments(prev => prev.filter(p => p._id !== id));
      setToast({ open: true, msg: "Payment deleted", sev: "success" });
    } catch { setToast({ open: true, msg: "Failed to delete", sev: "error" }); }
  };

  // ── Send Reminder ──
  const handleSendReminder = async (id) => {
    try {
      setToast({ open: true, msg: "Sending reminder email...", sev: "info" });
      const res = await fetch(`${API}/api/payments/${id}/remind`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send reminder");
      }
      setToast({ open: true, msg: "Reminder email sent successfully!", sev: "success" });
    } catch (e) {
      setToast({ open: true, msg: e.message || "Failed to send email", sev: "error" });
    }
  };

  // ── Filtering & search ──
  const displayed = payments.filter(p => {
    const matchStatus = filter === "All" || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.studentId?.name?.toLowerCase().includes(q)
      || p.studentId?.email?.toLowerCase().includes(q)
      || p.studentId?.course?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const FILTERS = ["All", "Paid", "Unpaid"];
  const FILTER_STYLE = {
    All:    { active: { bg: "#EEF2FF", color: "#4F46E5", border: "#4F46E5" } },
    Paid:   { active: { bg: "#E8F5E9", color: "#2E7D32", border: "#2E7D32" } },
    Unpaid: { active: { bg: "#FFEBEE", color: "#C62828", border: "#C62828" } },
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Payments</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage all student fee records — add, update, and track dues.
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddOutlined />}
          onClick={() => setAddOpen(true)}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 2.5, py: 1.1, bgcolor: "#1E3A8A", "&:hover": { bgcolor: "#1e40af" } }}
        >
          Add Payment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Summary Cards ── */}
      {loading ? (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[0,1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={82} sx={{ flex: 1, minWidth: 150, borderRadius: 3 }} />)}
        </Box>
      ) : summary && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <StatCard label="Total Records"  value={summary.totalPayments}                        color="#1565C0" bg="#E3F2FD" icon={<PaymentOutlined />}          delay={0} />
          <StatCard label="Total Collected" value={`₹${summary.totalPaid?.toLocaleString()}`}  color="#2E7D32" bg="#E8F5E9" icon={<CheckCircleOutlined />}       delay={60} />
          <StatCard label="Total Dues"     value={`₹${summary.totalUnpaid?.toLocaleString()}`} color="#C62828" bg="#FFEBEE" icon={<ErrorOutlined />}             delay={120} />
          <StatCard label="Paid Records"   value={summary.paidCount}                            color="#0D9488" bg="#F0FDFA" icon={<AccountBalanceWallet />}      delay={180} />
          <StatCard label="Unpaid Records" value={summary.unpaidCount}                          color="#E65100" bg="#FFF3E0" icon={<CurrencyRupeeOutlined />}     delay={240} />
        </Box>
      )}

      {/* ── Filters + Search ── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
          {/* Status filter chips */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {FILTERS.map(f => {
              const s = FILTER_STYLE[f].active;
              return (
                <Chip key={f} label={f} onClick={() => setFilter(f)} clickable
                  icon={f === "Paid" ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : f === "Unpaid" ? <ErrorOutlined style={{ fontSize: 14 }} /> : <FilterListOutlined style={{ fontSize: 14 }} />}
                  sx={{
                    fontWeight: 700, fontSize: 12, height: 32,
                    backgroundColor: filter === f ? s.bg : "grey.100",
                    color: filter === f ? s.color : "text.secondary",
                    border: "1px solid", borderColor: filter === f ? s.border : "transparent",
                    "& .MuiChip-icon": { color: "inherit" },
                    transition: "all 0.15s ease",
                  }}
                />
              );
            })}
          </Box>

          {/* Search */}
          <TextField
            size="small" placeholder="Search student, course…" value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ ml: "auto", minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}><CloseOutlined sx={{ fontSize: 16 }} /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <Typography variant="body2" color="text.secondary">
            {displayed.length} record{displayed.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* ── Table ── */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[0,1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : displayed.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <PaymentOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography fontWeight={700} color="text.secondary">No payments found</Typography>
            <Typography variant="caption" color="text.disabled">
              {search ? "Try clearing your search" : "Click \"Add Payment\" to record the first one"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, borderColor: "grey.100" } }}>
                  <TableCell>#</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayed.map((p, idx) => {
                  const paid    = p.status === "Paid";
                  const student = p.studentId;
                  return (
                    <TableRow
                      key={p._id}
                      sx={{
                        "&:last-child td": { border: 0 },
                        "& td": { borderColor: "grey.100", py: 1.5 },
                        "&:hover": { backgroundColor: "grey.50" },
                        animation: "fadeIn 0.25s ease both",
                        animationDelay: `${idx * 25}ms`,
                        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.disabled">{idx + 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#E3F2FD", color: "#1565C0", fontSize: 12, fontWeight: 700 }}>
                            {student?.name?.[0]?.toUpperCase() || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap>{student?.name || "Unknown"}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{student?.email || "—"}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={student?.course || "—"} size="small"
                          sx={{ fontSize: 11, fontWeight: 600, height: 22, bgcolor: "#EEF2FF", color: "#4F46E5" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color={paid ? "#2E7D32" : "#C62828"}>
                          ₹{p.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={paid ? <CheckCircleOutlined style={{ fontSize: 13 }} /> : <ErrorOutlined style={{ fontSize: 13 }} />}
                          label={p.status} size="small"
                          sx={{
                            bgcolor: paid ? "#E8F5E9" : "#FFEBEE",
                            color:   paid ? "#2E7D32" : "#C62828",
                            fontWeight: 700, fontSize: 11, height: 24,
                            "& .MuiChip-icon": { color: "inherit" },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          {!paid && (
                            <Tooltip title="Send Email Reminder">
                              <IconButton size="small" onClick={() => handleSendReminder(p._id)}
                                sx={{ color: "#1976D2", "&:hover": { bgcolor: "#E3F2FD" } }}>
                                <EmailOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={`Mark as ${paid ? "Unpaid" : "Paid"}`}>
                            <IconButton size="small" onClick={() => handleToggleStatus(p)}
                              sx={{ color: paid ? "#E65100" : "#2E7D32", "&:hover": { bgcolor: paid ? "#FFF3E0" : "#E8F5E9" } }}>
                              <SwapHorizOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(p._id)}
                              sx={{ color: "text.disabled", "&:hover": { color: "#C62828", bgcolor: "#FFEBEE" } }}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Add Payment Dialog ── */}
      <AddPaymentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        students={students}
        onAdded={() => {
          fetchPayments();
          setToast({ open: true, msg: "Payment added successfully!", sev: "success" });
        }}
      />

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: 2 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WardenPayments;
