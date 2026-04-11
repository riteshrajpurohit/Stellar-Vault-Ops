import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
      <div className="absolute inset-0 bg-aurora-radial opacity-70" />
      <div className="absolute left-[20%] top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[12rem] h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        <Topbar />
        <motion.main
          className="pb-10 pt-6 sm:pb-14 sm:pt-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
