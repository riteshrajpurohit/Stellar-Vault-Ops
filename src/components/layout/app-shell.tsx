import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
      <div className="absolute inset-0 bg-aurora-radial opacity-70" />
      <div className="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <motion.main
            className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
