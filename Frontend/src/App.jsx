
import { ThemeProvider } from "@mui/material/styles";
import theme from "./themes/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/appRoutes";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

    </ThemeProvider>
  );
};

export default App;