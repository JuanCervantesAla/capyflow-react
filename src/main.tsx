import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/700.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import './index.css';


const theme = createTheme({
  fontFamily: "Inter, sans-serif",            
  headings: {
    fontFamily: "DM Sans, sans-serif",        
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
