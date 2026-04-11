import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { navigationItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-label="Close navigation overlay"
            onClick={onClose}
          />
          <motion.div
            className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-slate-950/95 p-4 shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <span className="text-sm font-semibold text-white">
                Navigation
              </span>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-2xl"
                onClick={onClose}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="mt-4 grid gap-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className="justify-start rounded-2xl px-4 py-3 text-left"
                >
                  <a href={item.href} onClick={onClose}>
                    {item.label}
                  </a>
                </Button>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
