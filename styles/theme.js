// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'DM Serif Text', serif"
  },
  palette: {
    primary: {
      dark: "#143323", // customize this
      main: "#1D4832", // customize this
      white: "#FFF",
      black: "#000",
    },
    secondary: {
      main: "#FDE200", // customize this
      red: "#ba0d0d"
    },
  },
});

export default theme;
