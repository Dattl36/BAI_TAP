import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, App } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "antd/dist/reset.css";
import "./index.css";
import "./assets/styles/global.css";

import { queryClient } from "./app/queryClient";
import { router } from "./app/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#bca374",
          colorBgLayout: "#faf7f2",
          colorTextBase: "#1a1a1a",
          borderRadius: 8,
          fontFamily:
            "Outfit, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            colorPrimaryHover: "#a38b5f",
          },
          Card: {
            borderRadiusLG: 16,
          },
          Table: {
            borderRadius: 12,
            headerBg: "#faf8f5",
          },
          Menu: {
            itemBorderRadius: 8,
            darkItemBg: "transparent",
            darkItemSelectedBg: "linear-gradient(135deg, #bca374 0%, #a38b5f 100%)",
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App>
          <RouterProvider router={router} />
        </App>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
