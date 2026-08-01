import { Box, FileUp, LayoutDashboard, ListChecks, ScrollText, Settings as SettingsIcon } from "lucide-react";
import { ExecutionsPage } from "../pages/ExecutionsPage";
import { LogsPage } from "../pages/LogsPage";
import { SandboxPage } from "../pages/SandboxPage";
import { UploadPage } from "../pages/UploadPage";
import { Dashboard } from "../pages/Dashboard";
import { Settings } from "../pages/Settings";

export const coreRoutes = [
  { path: "dashboard", label: "Dashboard", icon: LayoutDashboard, element: <Dashboard /> },
  { path: "sandbox", label: "Sandbox", icon: Box, element: <SandboxPage /> },
  { path: "upload", label: "Upload", icon: FileUp, element: <UploadPage /> },
  { path: "executions", label: "Executions", icon: ListChecks, element: <ExecutionsPage /> },
  { path: "logs", label: "Logs", icon: ScrollText, element: <LogsPage /> },
  { path: "settings", label: "Settings", icon: SettingsIcon, element: <Settings /> },
];