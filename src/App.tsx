/**
 * Stellar Vault Ops - Main Application Entrypoint
 * 
 * Sets up the application shell, provides the Freighter wallet connection context,
 * and renders the operational treasury dashboard page.
 */
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard-page";
import { WalletConnectionProvider } from "@/lib/wallet/wallet-context";

export default function App() {
  return (
    <WalletConnectionProvider>
      <AppShell>
        <DashboardPage />
      </AppShell>
    </WalletConnectionProvider>
  );
}
