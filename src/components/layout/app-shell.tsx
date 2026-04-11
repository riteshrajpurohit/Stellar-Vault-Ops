import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-aurora-radial opacity-70" />
      <div className="absolute left-[20%] top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[12rem] h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute left-[40%] bottom-[5%] h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

      {/* Main layout */}
      <div className="relative flex flex-col min-h-screen">
        {/* Navbar */}
        <Topbar />

        {/* Main content area */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            className="py-4 sm:py-6 md:py-8 lg:py-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer spacer */}
        <div className="h-6 sm:h-8" />
      </div>
    </div>
  );
}
