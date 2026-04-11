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
