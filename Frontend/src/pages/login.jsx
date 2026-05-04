import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
  Collapse,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  MeetingRoom,
  PersonOutlined,
  LockOutlined,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    icon: <School fontSize="small" />,
    color: "#1565C0",
    bg: "#E3F2FD",
    description: "Sign in to access your hostel dashboard",
    redirectPath: "/student",
  },
  warden: {
    label: "Warden",
    icon: <MeetingRoom fontSize="small" />,
    color: "#1B5E20",
    bg: "#E8F5E9",
    description: "Sign in to manage hostel operations",
    redirectPath: "/warden",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Backend accepts username OR email — we use username field here
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setLoginError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username or email is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 characters";
    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // needed to receive the cookie token
        body: JSON.stringify({
          username: form.username,   // backend checks $or: [username, email]
          email: form.username,      // so passing same value covers both cases
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Login failed. Please try again.");
        return;
      }

      // Verify the role matches what the user selected
      if (data.user.role !== role) {
        setLoginError(`This account is registered as a ${data.user.role}, not a ${role}.`);
        return;
      }

      // Token is set as cookie by backend; save user info in localStorage
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSubmitted(true);
      setTimeout(() => navigate(ROLE_CONFIG[role].redirectPath), 1500);

    } catch {
      setLoginError("Network error. Please check your connection and that the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const config = ROLE_CONFIG[role];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", backgroundColor: "#F4F6F9" }}>
      <AuthNavbar />
      
      {/* Left Branding Panel (Hidden on small screens) */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flex: 1, 
          backgroundColor: "primary.main",
          background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
          color: "white",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box sx={{ maxWidth: 480, zIndex: 1, textAlign: "left" }}>
          <Typography variant="h3" fontWeight={800} mb={3} lineHeight={1.2}>
            Manage your hostel operations with ease.
          </Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9 }}>
            HostelEase provides a complete suite of tools for students and wardens to streamline daily tasks, room allotments, and payments.
          </Typography>
        </Box>
        {/* Decorative background elements */}
        <Box sx={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -50, left: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      </Box>

      {/* Right Form Panel */}
      <Box 
        sx={{ 
          flex: { xs: 1, md: 0.8, lg: 0.6 }, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          p: { xs: 3, sm: 6, md: 8 },
          pt: { xs: 12, md: 8 }, // Account for navbar
          backgroundColor: "#F4F6F9"
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your details to sign in.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "#ffffff",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 4,
                pt: 4,
                pb: 3,
                background: `linear-gradient(135deg, ${config.color}18 0%, ${config.color}08 100%)`,
                borderBottom: "1px solid",
                borderColor: "grey.100",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "background 0.3s ease",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: config.color,
                  width: 48,
                  height: 48,
                  transition: "background-color 0.3s ease",
                }}
              >
                <LoginIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.2}>
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {config.description}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 4, py: 4 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={0.8}
              >
                Sign In As
              </Typography>

              <ToggleButtonGroup
                value={role}
                exclusive
                onChange={(_, val) => val && setRole(val)}
                fullWidth
                sx={{ mt: 1, mb: 3, gap: 1 }}
              >
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                  <ToggleButton
                    key={key}
                    value={key}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: "10px !important",
                      border: "1px solid !important",
                      borderColor: role === key ? `${cfg.color} !important` : "grey.200 !important",
                      backgroundColor: role === key ? `${cfg.bg} !important` : "transparent",
                      color: role === key ? cfg.color : "text.secondary",
                      fontWeight: role === key ? 700 : 400,
                      fontSize: 13,
                      gap: 0.75,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: `${cfg.bg} !important`,
                        borderColor: `${cfg.color} !important`,
                        color: cfg.color,
                      },
                    }}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Username or Email"
                  value={form.username}
                  onChange={handleChange("username")}
                  error={!!errors.username}
                  helperText={errors.username}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined fontSize="small" sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                <Link
                  component="button"
                  variant="body2"
                  underline="hover"
                  sx={{ color: config.color, fontWeight: 500 }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </Link>
              </Box>

              <Collapse in={!!loginError}>
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {loginError}
                </Alert>
              </Collapse>

              <Collapse in={submitted}>
                <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                  Login successful! Redirecting to {config.label} dashboard…
                </Alert>
              </Collapse>

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                disabled={submitted || loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: "none",
                  backgroundColor: config.color,
                  "&:hover": { backgroundColor: config.color, filter: "brightness(0.9)" },
                  "&:disabled": { backgroundColor: "grey.300" },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Signing In..." : `Sign In as ${config.label}`}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    sx={{ color: config.color, fontWeight: 600 }}
                    onClick={() => navigate("/signup")}
                  >
                    Create an Account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;