import { Loader2, LogOut, Wallet } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { Button } from "@/components/ui/button";

interface ConnectWalletButtonProps {
  className?: string;
}

export function ConnectWalletButton({ className }: ConnectWalletButtonProps) {
  const { isConnected, isLoading, connect, disconnect, isInstalled } =
    useWalletConnection();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    await connect();
  };

  return (
    <Button
      variant={isConnected ? "secondary" : "default"}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isConnected ? (
        <LogOut className="h-4 w-4" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {isLoading
        ? "Connecting..."
        : isConnected
          ? "Disconnect"
          : isInstalled
            ? "Connect Wallet"
            : "Connect Freighter"}
    </Button>
  );
}
