import { Box, FileUp, ListChecks, ScrollText } from "lucide-react";
import { ExecutionsPage } from "../pages/ExecutionsPage";
import { LogsPage } from "../pages/LogsPage";
import { SandboxPage } from "../pages/SandboxPage";
import { UploadPage } from "../pages/UploadPage";

export const coreRoutes = [
  { path: "sandbox", label: "Sandbox", icon: Box, element: <SandboxPage /> },
  { path: "upload", label: "Upload", icon: FileUp, element: <UploadPage /> },
  { path: "executions", label: "Executions", icon: ListChecks, element: <ExecutionsPage /> },
  { path: "logs", label: "Logs", icon: ScrollText, element: <LogsPage /> },
];