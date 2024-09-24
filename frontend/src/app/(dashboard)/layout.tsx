"use client";

import { useEffect } from "react";
import authStore from "@/store/authStore";
import assetStore from "@/store/supportedAssetsStore";
import walletStore from "@/store/walletStore";
import websocketService from "@/services/websocket.service";
import { usePathname } from "next/navigation";
import PostLogin from "./page";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    async function initializeData() {
      try {
        if (!authStore.user) {
          await authStore.fetchUser();
        }

        if (authStore.user) {
          websocketService.connect('ws://localhost:3000', authStore.user.id);
          await walletStore.fetchUserWallet();
          await assetStore.getSupportedAssetsFromDb();
          console.log('Wallet data:', JSON.parse(JSON.stringify(walletStore.wallet)));
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    }

    initializeData();
  }, []);

  const getPageTitle = () => {
    const path = pathname.split('/').pop() || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const pageTitle = getPageTitle();

  return (
    <PostLogin title={pageTitle}>
      {children}
    </PostLogin>
  );
}
