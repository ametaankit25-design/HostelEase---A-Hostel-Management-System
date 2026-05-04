import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, AppBar, Toolbar, Typography, Avatar,
  Divider, IconButton, Tooltip, Chip, Badge,
} from "@mui/material";
import {
  Dashboard, Payment, Logout, MeetingRoom,
  School, Assessment, KeyboardArrowRight, NotificationsOutlined,
} from "@mui/icons-material";
import { useState, useEffect } from "react";

const drawerWidth = 260;

const SIDEBAR_BG = "linear-gradient(180deg, #312e81 0%, #3730a3 55%, #4338ca 100%)";
const ACTIVE_BG  = "rgba(255,255,255,0.15)";
const HOVER_BG   = "rgba(255,255,255,0.08)";

const navItems = [
  { label: "Dashboard", icon: <Dashboard fontSize="small" />,   path: "/student" },
  { label: "Payments",  icon: <Payment fontSize="small" />,     path: "/student/payments" },
  { label: "My Room",   icon: <MeetingRoom fontSize="small" />, path: "/student/room" },
  { label: "Reports",   icon: <Assessment fontSize="small" />,  path: "/student/addreport" },
];

const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const StudentLayout = () => {
  const location    = useLocation();
  const navigate    = useNavigate();
  const time        = useClock();

  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user.username || "Student";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentPage = navItems.find((n) => n.path === location.pathname)?.label ?? "Student Portal";

  const clockStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const dateStr = time.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6F9" }}>

      {/* ── Premium Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: SIDEBAR_BG,
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(49, 46, 129, 0.2)",
          },
        }}
      >
        {/* Brand Logo */}
        <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
            <School sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Box>
            <Typography fontWeight={800} color="#fff" fontSize={15} lineHeight={1.2}>HostelEase</Typography>
            <Typography fontSize={11} sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Student Portal</Typography>
          </Box>
        </Box>

        {/* User Profile Card */}
        <Box sx={{ mx: 2, my: 2, p: 2, borderRadius: 2, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", width: 36, height: 36, fontSize: 14, fontWeight: 700, border: "2px solid rgba(255,255,255,0.3)" }}>
            {displayName[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography fontSize={13} fontWeight={700} color="#fff" noWrap>{displayName}</Typography>
            <Chip label="Student" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }} />
          </Box>
        </Box>

        {/* Nav Label */}
        <Box sx={{ px: 3, pb: 1 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, fontSize: 10 }}>Main Menu</Typography>
        </Box>

        {/* Nav Items */}
        <List sx={{ px: 2, gap: 0.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link} to={item.path}
                  sx={{ borderRadius: 2, px: 2, py: 1.1, backgroundColor: active ? ACTIVE_BG : "transparent", border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)", "&:hover": { backgroundColor: HOVER_BG, color: "#fff" }, transition: "all 0.15s ease", mb: 0.25 }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 13.5, fontWeight: active ? 700 : 500 } }} />
                  {active && <KeyboardArrowRight sx={{ fontSize: 16, opacity: 0.8 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout */}
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2, mb: 1 }} />
        <Box sx={{ px: 2, pb: 3 }}>
          <ListItemButton onClick={handleLogout}
            sx={{ borderRadius: 2, px: 2, py: 1.1, color: "rgba(255,255,255,0.55)", border: "1px solid transparent", "&:hover": { backgroundColor: "rgba(239,68,68,0.15)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }, transition: "all 0.15s ease" }}>
            <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}><Logout fontSize="small" /></ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Right Column */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>

        {/* ── Top AppBar ── */}
        <AppBar position="sticky" elevation={0}
          sx={{ backgroundColor: "#fff", borderBottom: "1px solid", borderColor: "grey.200", zIndex: 1100 }}>
          <Toolbar sx={{ justifyContent: "space-between", minHeight: "64px !important", px: { xs: 2, sm: 3 } }}>

            {/* Left: greeting + breadcrumb */}
            <Box>
              <Typography fontWeight={700} color="text.primary" fontSize={16} lineHeight={1.2}>
                {getGreeting()}, {displayName} 👋
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography fontSize={11} color="text.disabled">HostelEase</Typography>
                <Typography fontSize={11} color="text.disabled">›</Typography>
                <Typography fontSize={11} color="#4338ca" fontWeight={600}>{currentPage}</Typography>
              </Box>
            </Box>

            {/* Right: clock + notifications + avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Live clock */}
              <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
                <Typography fontSize={13} fontWeight={700} color="text.primary" lineHeight={1.2}>{clockStr}</Typography>
                <Typography fontSize={11} color="text.disabled">{dateStr}</Typography>
              </Box>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: "text.secondary", backgroundColor: "grey.50", border: "1px solid", borderColor: "grey.200", "&:hover": { backgroundColor: "grey.100" } }}>
                  <Badge badgeContent={2} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 16, minWidth: 16 } }}>
                    <NotificationsOutlined fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>{displayName}</Typography>
              <Avatar sx={{ background: "linear-gradient(135deg, #312e81, #4F46E5)", color: "#fff", width: 34, height: 34, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {displayName[0]?.toUpperCase()}
              </Avatar>
              <Tooltip title="Logout">
                <IconButton size="small" onClick={handleLogout} sx={{ color: "text.disabled" }}>
                  <Logout fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ── Main Content ── */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default StudentLayout;