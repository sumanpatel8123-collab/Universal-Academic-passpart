import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The requested passport page or credential record does not exist on the Stellar Academic Passport system.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-xl transition-all"
      >
        Return to Passport Dashboard
      </Link>
    </div>
  );
}
