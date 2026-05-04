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
  EmailOutlined,
  LockOutlined,
  BadgeOutlined,
  AppRegistration,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    icon: <School fontSize="small" />,
    color: "#4F46E5",
    bg: "#eef2ff",
    apiEndpoint: "/api/auth/register",
    description: "Register as a student to access hostel facilities",
    redirectPath: "/student",
  },
  warden: {
    label: "Warden",
    icon: <MeetingRoom fontSize="small" />,
    color: "#0D9488",
    bg: "#f0fdfa",
    apiEndpoint: "/api/auth/register",
    description: "Register as a warden to manage hostel operations",
    redirectPath: "/warden",
  },
};

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSignupError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.length < 3) newErrors.username = "Minimum 3 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 characters";

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSignupError("");

    try {
      const config = ROLE_CONFIG[role];
      const response = await fetch(`${import.meta.env.VITE_API_URL}${config.apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSubmitted(true);
      setTimeout(() => navigate(ROLE_CONFIG[role].redirectPath), 1500);

    } catch {
      setSignupError("Network error. Please check your connection and that the server is running.");
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your details to register.
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
              }}
            >
              <Avatar sx={{ bgcolor: config.color, width: 48, height: 48 }}>
                <AppRegistration />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {config.description}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 4, py: 4 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
              >
                Register As
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
                  label="Email"
                  value={form.email}
                  onChange={handleChange("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined fontSize="small" sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Username"
                  value={form.username}
                  onChange={handleChange("username")}
                  error={!!errors.username}
                  helperText={errors.username}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlined fontSize="small" sx={{ color: "text.disabled" }} />
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
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                          {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Collapse in={!!signupError}>
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {signupError}
                </Alert>
              </Collapse>

              <Collapse in={submitted}>
                <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                  Registration successful! Redirecting...
                </Alert>
              </Collapse>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSignup}
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
                {loading ? "Registering..." : `Register as ${config.label}`}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    sx={{ color: config.color, fontWeight: 600 }}
                    onClick={() => navigate("/login")}
                  >
                    Sign In
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
export default Signup;
