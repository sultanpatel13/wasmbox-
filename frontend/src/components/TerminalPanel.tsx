import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import "xterm/css/xterm.css";
import { Play, SquareTerminal, X, Search } from "lucide-react";
import { runtimeActions } from "../store/runtimeStore";
import type { Execution } from "../types/execution";

interface TerminalPanelProps {
  command: string;
  executions: Execution[];
  loading: boolean;
}

export function TerminalPanel({ command, executions, loading }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const [sessionId, setSessionId] = useState<string>("idle-session");
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const latest = executions[0];

  useEffect(() => {
    if (!terminalRef.current || termRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
        cursorAccent: "#0d1117",
        selectionBackground: "rgba(88, 166, 255, 0.3)",
        black: "#161b22",
        red: "#f85149",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#a371f7",
        cyan: "#39c5cf",
        white: "#e6edf3",
        brightBlack: "#484f58",
        brightRed: "#ff7b72",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#56d4dd",
        brightWhite: "#ffffff",
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.6,
      letterSpacing: 0,
      allowProposedApi: true,
      convertEol: true,
      scrollback: 10000,
      tabStopWidth: 4,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    const unicode11Addon = new Unicode11Addon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(unicode11Addon);

    term.open(terminalRef.current);
    fitAddon.fit();

    term.write("\x1b[1;36mWelcome to WasmBox Sandbox\x1b[0m\r\n");
    term.write("\x1b[2mSelect a module and press Run to start execution\x1b[0m\r\n\r\n");
    term.write("$ \x1b[0m");

    termRef.current = term;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;
    setIsConnected(true);

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (!latest || !termRef.current) return;

    const term = termRef.current;
    const output = latest.output;

    term.write("\r\n\x1b[1;33m--- Execution Started ---\x1b[0m\r\n");
    term.write(`\x1b[2mCommand: ${latest.command}\x1b[0m\r\n`);
    term.write(`\x1b[2mModule: ${latest.moduleName}\x1b[0m\r\n\r\n`);

    const lines = output.split("\n");
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") return;
      if (line.includes("error") || line.includes("Error") || line.includes("FAILED")) {
        term.write(`\x1b[1;31m${line}\x1b[0m\r\n`);
      } else if (line.includes("warn") || line.includes("Warn") || line.includes("WARNING")) {
        term.write(`\x1b[1;33m${line}\x1b[0m\r\n`);
      } else if (line.includes("debug") || line.includes("Debug")) {
        term.write(`\x1b[2m${line}\x1b[0m\r\n`);
      } else {
        term.write(`${line}\r\n`);
      }
    });

    if (latest.status === "completed") {
      term.write(`\r\n\x1b[1;32m--- Execution Completed (${latest.durationMs}ms) ---\x1b[0m\r\n`);
    } else if (latest.status === "failed") {
      term.write(`\r\n\x1b[1;31m--- Execution Failed ---\x1b[0m\r\n`);
    } else if (latest.status === "running") {
      term.write(`\r\n\x1b[1;36m--- Execution Running ---\x1b[0m\r\n`);
    }

    term.write("$ ");
    setSessionId(latest.id);
  }, [latest?.id]);

  const handleRun = () => {
    if (loading) return;
    void runtimeActions.startExecution();
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (searchAddonRef.current && term) {
      searchAddonRef.current.findNext(term);
    }
  };

  const handleSearchNext = () => {
    if (searchAddonRef.current && searchTerm) {
      searchAddonRef.current.findNext(searchTerm);
    }
  };

  const handleSearchPrev = () => {
    if (searchAddonRef.current && searchTerm) {
      searchAddonRef.current.findPrevious(searchTerm);
    }
  };

  const clearTerminal = () => {
    if (termRef.current) {
      termRef.current.clear();
      termRef.current.write("\x1b[1;36mTerminal cleared\x1b[0m\r\n$ ");
    }
  };

  return (
    <section className="panel terminal-panel">
      <div className="panel-header">
        <div>
          <h2>Sandbox Terminal</h2>
          <p>Run the selected WASM module with controlled permissions.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div className="search-input" style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.shiftKey ? handleSearchPrev() : handleSearchNext();
                }
              }}
              style={{ paddingLeft: "36px", width: "200px" }}
            />
          </div>
          <button className="icon-button secondary" onClick={clearTerminal} title="Clear terminal">
            <X size={16} />
          </button>
          <button className="icon-button primary" onClick={handleRun} disabled={loading}>
            <Play size={18} />
            <span>Run</span>
          </button>
        </div>
      </div>

      <label className="field">
        <span>Command</span>
        <input value={command} onChange={(event) => runtimeActions.setCommand(event.target.value)} />
      </label>

      <div className="terminal-wrapper">
        <div className="terminal-title">
          <SquareTerminal size={16} />
          <span>{sessionId}</span>
          <span className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
            {isConnected ? "● Connected" : "○ Disconnected"}
          </span>
        </div>
        <div ref={terminalRef} className="xterm-container" />
      </div>
    </section>
  );
}