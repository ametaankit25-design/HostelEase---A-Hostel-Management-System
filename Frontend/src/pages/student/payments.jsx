import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Chip, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";
import {
  CheckCircleOutlined, PendingOutlined, PaymentOutlined, ErrorOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

// ── summary card ────────────────────────────────────────────
const SummaryCard = ({ label, value, color, bg, icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "grey.100",
      flex: 1,
      minWidth: 140,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

// ── main component ──────────────────────────────────────────
const Payments = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All | Paid | Unpaid

  useEffect(() => {
    if (!user?.id) return;

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/payments/${user.email}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load payments");
        setPayments(data.data || []);
        setSummary(data.summary || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id, user?.email]);

  const filtered = filter === "All"
    ? payments
    : payments.filter((p) => p.status === filter);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Payments</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Full payment history for {user?.username || "your account"}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Summary cards ── */}
      {summary && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <SummaryCard
            label="TOTAL PAID"
            value={`₹${summary.totalPaid?.toLocaleString()}`}
            color="#2E7D32"
            bg="#E8F5E9"
            icon={<CheckCircleOutlined />}
          />
          <SummaryCard
            label="PENDING DUES"
            value={`₹${summary.pendingDues?.toLocaleString()}`}
            color="#C62828"
            bg="#FFEBEE"
            icon={<ErrorOutlined />}
          />
          <SummaryCard
            label="TOTAL RECORDS"
            value={summary.totalPayments}
            color="#1565C0"
            bg="#E3F2FD"
            icon={<PaymentOutlined />}
          />
        </Box>
      )}

      {/* ── Filter tabs ── */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
      >
        <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
          {["All", "Paid", "Unpaid"].map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setFilter(f)}
              sx={{
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                backgroundColor: filter === f
                  ? f === "Paid" ? "#E8F5E9" : f === "Unpaid" ? "#FFEBEE" : "#E3F2FD"
                  : "grey.100",
                color: filter === f
                  ? f === "Paid" ? "#2E7D32" : f === "Unpaid" ? "#C62828" : "#1565C0"
                  : "text.secondary",
                border: "1px solid",
                borderColor: filter === f
                  ? f === "Paid" ? "#2E7D32" : f === "Unpaid" ? "#C62828" : "#1565C0"
                  : "transparent",
              }}
            />
          ))}
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", alignSelf: "center" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* ── Table ── */}
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No {filter === "All" ? "" : filter.toLowerCase()} payments found.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: 12, borderColor: "grey.100" } }}>
                  <TableCell>#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((payment, idx) => {
                  const paid = payment.status === "Paid";
                  return (
                    <TableRow
                      key={payment._id}
                      sx={{
                        "&:last-child td": { border: 0 },
                        "& td": { borderColor: "grey.100", py: 1.5 },
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{idx + 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(payment.date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          ₹{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={paid
                            ? <CheckCircleOutlined style={{ fontSize: 14 }} />
                            : <PendingOutlined style={{ fontSize: 14 }} />}
                          label={payment.status}
                          size="small"
                          sx={{
                            backgroundColor: paid ? "#E8F5E9" : "#FFF3E0",
                            color: paid ? "#2E7D32" : "#E65100",
                            fontWeight: 700,
                            fontSize: 11,
                            height: 26,
                            "& .MuiChip-icon": { color: "inherit" },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Payments;