import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { SocketProvider } from "@/providers/SocketProvider";
import App from "./App";

import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <SocketProvider>
                    <App />
                </SocketProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);