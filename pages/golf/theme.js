// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1D4832", // customize this
      white: "#FFF",
      black: "#000",
    },
    secondary: {
      main: "#FDE200", // customize this
    },
  },
});

export default theme;
