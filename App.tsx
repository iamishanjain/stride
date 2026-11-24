import "./global.css";
import React from "react";
import { AppProviders } from "./src/app/AppProviders";
import { AppContent } from "./src/app/AppContent";
import "./src/features/tracking/services/BackgroundLocationTask";

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
