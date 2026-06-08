"use client";
import { useEffect } from "react";

export function SwRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[sw] registratie mislukt:", err));
    }
  }, []);
  return null;
}
