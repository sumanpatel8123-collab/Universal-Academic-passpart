"use client";

import { useState, useEffect } from "react";
import {
  connectFreighterWallet,
  checkFreighterInstalled,
  issueCredentialOnChain,
  verifyCredentialOnChain,
  formatAddress,
  sanitizeTxHash,
  getExplorerTxUrl,
  CredentialRecord,
  STELLAR_TESTNET_CONFIG,
} from "@/utils/stellar";
import {
  GraduationCap,
  ShieldCheck,
  Wallet,
  Building2,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Search,
  PlusCircle,
  Copy,
  Check,
  QrCode,
  Lock,
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  AlertCircle,
  Clock,
  Coins,
} from "lucide-react";

export default function Home() {
  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [freighterInstalled, setFreighterInstalled] = useState<boolean>(true);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Active View State: 'admin' | 'student' | 'verifier'
  const [activeTab, setActiveTab] = useState<"student" | "admin" | "verifier">("student");

  // Admin Issue Form State
  const [studentInputAddress, setStudentInputAddress] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("MIT International Institute of Tech");
  const [degreeIdInput, setDegreeIdInput] = useState<string>("");

  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [issueStatus, setIssueStatus] = useState<{ type: "success" | "error" | null; msg: string; txHash?: string }>({
    type: null,
    msg: "",
  });

  // Student / Verifier Credentials State
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [isLoadingCreds, setIsLoadingCreds] = useState<boolean>(false);
  const [searchAddress, setSearchAddress] = useState<string>("");

  // Modal State
  const [selectedCredForQr, setSelectedCredForQr] = useState<CredentialRecord | null>(null);

  // Initialize & check wallet on load
  useEffect(() => {
    async function init() {
      const installed = await checkFreighterInstalled();
      setFreighterInstalled(installed);

      // Default demo address if wallet not connected initially
      const demoStudentAddr = "GDF83748293481239847238947239487239487239487";
      loadCredentials(demoStudentAddr);
    }
    init();
  }, []);

  // Fetch credentials whenever wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadCredentials(walletAddress);
    }
  }, [walletAddress]);

  const loadCredentials = async (targetAddress: string) => {
    if (!targetAddress) return;
    setIsLoadingCreds(true);
    try {
      const result = await verifyCredentialOnChain(targetAddress);
      setCredentials(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCreds(false);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const addr = await connectFreighterWallet();
      setWalletAddress(addr);
      setStudentInputAddress(addr); // prefill admin form for testing ease
    } catch (error: any) {
      // Fallback demo connection if wallet extension is missing
      const mockAddr = "G" + Array.from({ length: 55 }, () => Math.floor(Math.random() * 36).toString(36).toUpperCase()).join("");
      setWalletAddress(mockAddr);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInputAddress || !courseName || !issueDate) {
      setIssueStatus({ type: "error", msg: "Please fill in all required credential fields." });
      return;
    }

    setIsIssuing(true);
    setIssueStatus({ type: null, msg: "" });

    try {
      const adminAddr = walletAddress || "GADMIN11111111111111111111111111111111111111111111";
      const generatedDegreeId = degreeIdInput || `MIT-DEG-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await issueCredentialOnChain(
        adminAddr,
        studentInputAddress,
        courseName,
        issueDate,
        institutionName,
        generatedDegreeId
      );

      setIssueStatus({
        type: "success",
        msg: "Credential successfully minted & stored non-transferable (soulbound) on Stellar Testnet!",
        txHash: res.txHash,
      });

      // Clear inputs
      setCourseName("");
      setIssueDate("");
      setDegreeIdInput("");

      // Reload student view if watching same student
      if (activeTab === "student") {
        loadCredentials(studentInputAddress);
      }
    } catch (error: any) {
      setIssueStatus({
        type: "error",
        msg: error?.message || "Failed to mint credential on-chain.",
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleSearchVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddress.trim()) {
      loadCredentials(searchAddress.trim());
    }
  };

  const activeWallet = walletAddress || "GDF83748293481239847238947239487239487239487";

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0f] text-slate-100 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-hero-gradient pointer-events-none z-0 opacity-80" />

      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0d111a] rounded-[11px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white">Stellar Passport</h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Soroban Testnet
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Decentralized Soulbound Academic Credentials</p>
            </div>
          </div>

          {/* Center Navigation Switcher */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "student"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              My Academic Passport
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "admin"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              University Admin Portal
            </button>
            <button
              onClick={() => setActiveTab("verifier")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "verifier"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Search className="w-4 h-4" />
              Public Verifier
            </button>
          </nav>

          {/* Freighter Wallet Action Button */}
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 pl-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300">{formatAddress(walletAddress)}</span>
                </div>
                <button
                  onClick={() => handleCopy(walletAddress)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Copy Wallet Address"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 group-hover:opacity-90 transition-opacity" />
                <span className="relative flex items-center gap-2 bg-[#0d111a] px-4 py-2.5 rounded-[11px] text-cyan-300 group-hover:text-white transition-colors">
                  <Wallet className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                  {isConnecting ? "Connecting Freighter..." : "Connect Freighter Wallet"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 justify-around bg-[#0a0d14]">
          <button
            onClick={() => setActiveTab("student")}
            className={`text-xs font-medium py-1 px-3 rounded-md ${
              activeTab === "student" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
            }`}
          >
            Passport
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`text-xs font-medium py-1 px-3 rounded-md ${
              activeTab === "admin" ? "bg-purple-500/20 text-purple-300" : "text-slate-400"
            }`}
          >
            Admin Portal
          </button>
          <button
            onClick={() => setActiveTab("verifier")}
            className={`text-xs font-medium py-1 px-3 rounded-md ${
              activeTab === "verifier" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400"
            }`}
          >
            Verifier
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        {/* On-chain Protocol Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">On-Chain Credentials</p>
              <p className="text-xl font-bold text-white tracking-tight">1,429 Soulbound</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Verified Institutions</p>
              <p className="text-xl font-bold text-white tracking-tight">48 Universities</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Issuance Network Fee</p>
              <p className="text-xl font-bold text-white tracking-tight">{STELLAR_TESTNET_CONFIG.issuanceFeeXlm} XLM</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Soroban Network</p>
              <p className="text-xl font-bold text-white tracking-tight">Stellar Testnet</p>
            </div>
          </div>
        </div>

        {/* TAB 1: STUDENT ACADEMIC PASSPORT VIEW */}
        {activeTab === "student" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">Verified Academic Passport</h2>
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Soulbound ID
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Owner Wallet Address: <span className="text-cyan-400">{activeWallet}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadCredentials(activeWallet)}
                disabled={isLoadingCreds}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl transition-all self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCreds ? "animate-spin" : ""}`} />
                Refresh Passport
              </button>
            </div>

            {/* Credentials Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Issued Soulbound Degrees & Certifications ({credentials.length})
                </h3>
              </div>

              {isLoadingCreds ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl h-56 animate-pulse bg-slate-900/50" />
                  ))}
                </div>
              ) : credentials.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-dashed border-slate-800">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h4 className="text-base font-semibold text-slate-200">No On-Chain Credentials Found</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      No soulbound degree records are currently registered on Soroban for this wallet address. Switch to the Admin Portal to issue a new test credential.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Issue Credential as Admin
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-slate-800 hover:border-cyan-500/40"
                    >
                      {/* Decorative Badge */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                              Verified Degree
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{cred.degreeId}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mt-2">
                            {cred.courseName}
                          </h4>
                          <p className="text-xs text-cyan-400 font-medium">{cred.institution}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-500 text-[10px]">Issue Date</p>
                          <p className="font-semibold text-slate-300 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {cred.issueDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px]">Smart Contract</p>
                          <p className="font-mono text-slate-300 mt-0.5 text-[11px] truncate">
                            {formatAddress(STELLAR_TESTNET_CONFIG.contractId)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Immutable On-Chain
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCredForQr(cred)}
                            className="p-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            title="Generate Shareable Verification QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-cyan-400" /> QR
                          </button>
                          <a
                            href={getExplorerTxUrl(cred.txHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            title="View on Stellar Expert Explorer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" /> Explorer
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSITY ADMIN PANEL */}
        {activeTab === "admin" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">University Admin Issuance Portal</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute Soroban <code className="text-purple-300 font-mono bg-purple-950/50 px-1.5 py-0.5 rounded">issue_credential</code> smart contract calls to mint non-transferable soulbound records.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full hidden sm:block">
                  Requires Admin Auth
                </span>
              </div>

              {issueStatus.msg && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                    issueStatus.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {issueStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p>{issueStatus.msg}</p>
                    {issueStatus.txHash && (
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] opacity-90 break-all pt-1">
                        <span>Tx Hash: {sanitizeTxHash(issueStatus.txHash)}</span>
                        <a
                          href={getExplorerTxUrl(issueStatus.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 font-sans font-medium underline flex items-center gap-0.5 ml-1"
                        >
                          View on Stellar Expert <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleIssueCredential} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Wallet Address (Stellar Testnet G-Address) *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentInputAddress}
                    onChange={(e) => setStudentInputAddress(e.target.value)}
                    placeholder="GDF8374829348123..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Course Name / Degree Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="B.S. Artificial Intelligence & Cryptography"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Issuing Institution
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="MIT International Institute of Tech"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Custom Degree ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={degreeIdInput}
                      onChange={(e) => setDegreeIdInput(e.target.value)}
                      placeholder="MIT-CS-2026-9901"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Smart Contract Invocation Fee</span>
                    <span className="font-semibold text-cyan-400">{STELLAR_TESTNET_CONFIG.issuanceFeeXlm} XLM</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Storage Tokenization Type</span>
                    <span className="font-semibold text-purple-400">Soulbound (Non-Transferable)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isIssuing}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isIssuing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Minting Credential on Soroban...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Execute issue_credential Transaction
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLIC VERIFIER VIEW */}
        {activeTab === "verifier" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  Public On-Chain Credential Verifier
                </h2>
                <p className="text-xs text-slate-400">
                  Verify academic credentials issued to any student address on Soroban smart contract in real time.
                </p>
              </div>

              <form onSubmit={handleSearchVerify} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter Student Wallet Address (G...)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> Verify Address
                </button>
              </form>
            </div>

            {/* Results display */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Verification Results ({credentials.length})
              </h3>
              {credentials.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-400">
                  No verified records found for the searched address.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {credentials.map((c) => (
                    <div key={c.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400">{c.degreeId}</span>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Verified Authentic
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base">{c.courseName}</h4>
                      <p className="text-xs text-slate-400">{c.institution}</p>
                      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Issued: {c.issueDate}</span>
                        <span className="font-mono text-slate-400">{formatAddress(c.studentAddress)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* QR Verification Modal */}
      {selectedCredForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-slate-700 text-center space-y-4 relative">
            <button
              onClick={() => setSelectedCredForQr(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{selectedCredForQr.courseName}</h3>
              <p className="text-xs text-cyan-400">{selectedCredForQr.institution}</p>
            </div>
            {/* Simulated QR Code Graphic */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="w-full h-full border-4 border-slate-900 p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-slate-900" />
                  <div className="w-8 h-8 bg-slate-900" />
                </div>
                <div className="text-[8px] font-mono text-slate-900 text-center break-all font-bold">
                  {selectedCredForQr.degreeId}
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-slate-900" />
                  <div className="w-2 h-2 bg-slate-900" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-400 font-mono break-all">
                Tx: {formatAddress(sanitizeTxHash(selectedCredForQr.txHash))}
              </p>
              <a
                href={getExplorerTxUrl(selectedCredForQr.txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center justify-center gap-1 font-medium pt-1"
              >
                Verify on Stellar Expert Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => setSelectedCredForQr(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Close Verification Badge
            </button>
          </div>
        </div>
      )}

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#06080c] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Universal Academic Passport &copy; 2026 • Soroban Smart Contracts</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Stellar Testnet RPC</span>
            <span>Freighter Wallet Enabled</span>
            <span>Soulbound Tokens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
