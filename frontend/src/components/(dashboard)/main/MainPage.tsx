"use client";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { IconWallet, IconReceipt2, IconCoin, IconLoader2, IconRefresh } from "@tabler/icons-react";
import walletStore from "@/store/walletStore";
import transactionStore from "@/store/transactionStore";
import { BentoGrid, BentoGridItem } from "@/foundation/bento-grid";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { calculateTotalUSDValue } from "@/services/cmc.service";
import { Button } from "@/foundation/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/foundation/tooltip";

export const Dashboard = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      
      if (transactionStore.transactions.length === 0) {
        await transactionStore.fetchTransactions();
      }

      console.log(parseFloat(walletStore.usdBalance) == 0)
      if (parseFloat(walletStore.usdBalance) == 0) {
        console.log("Going to fetch USD balance.")
        await fetchTotalUSDValue();
      } else {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const fetchTotalUSDValue = async () => {
    const assets = walletStore.wallet.assets || [];
    const assetsWithBalance = assets.filter(asset => parseFloat(asset.balance) > 0);
    
    if (assetsWithBalance.length > 0) {
      const usdValue = await calculateTotalUSDValue(assetsWithBalance);
      walletStore.setUsdBalance(usdValue.toFixed(2));
    } else {
      walletStore.setUsdBalance("0");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTotalUSDValue();
  };

  const assetCount = walletStore.wallet.assets?.length || 0;
  const transactionCount = transactionStore.transactions.length;

  const dashboardItems = [
    {
      title: "Total Balance",
      value: isLoading ? <IconLoader2 className="h-8 w-8 text-[#0275f2] spinner" /> : `$${walletStore.usdBalance}`,
      icon: <IconCoin className="h-4 w-4 text-[#0275f2]" />,
      className: "col-span-full bg-gradient-to-r from-[#0275f20a] to-[#1d4dc50a]",
      refreshButton: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-2 right-2"
              >
                <IconRefresh className={`h-5 w-5 text-[#0275f2] ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={5}>
              Refresh USD Balance
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      title: "Total Assets",
      value: assetCount,
      icon: <IconWallet className="h-4 w-4 text-[#0275f2]" />,
      className: "bg-gradient-to-r from-[#0275f20a] to-[#1d4dc50a]",
      link: "/wallet",
      linkText: "Go to your assets",
    },
    {
      title: "Transactions",
      value: transactionCount,
      icon: <IconReceipt2 className="h-4 w-4 text-[#0275f2]" />,
      className: "bg-gradient-to-l from-[#0275f20a] to-[#1d4dc50a]",
      link: "/transactions",
      linkText: "View transactions",
    },
  ];

  return (
    <div className="max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <BentoGrid className="md:auto-rows-[20rem] grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardItems.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={
              <div className="flex flex-col h-full justify-between">
                <div className="text-sm text-gray-500">
                  {item.title === "Total Assets" && `You have ${assetCount} assets in your wallet.`}
                  {item.title === "Transactions" && `You have made ${transactionCount} transactions.`}
                  {item.title === "Total Balance" && (isLoading ? "Calculating total balance..." : `Your total balance is ${item.value}`)}
                </div>
                {item.link && (
                  <div className="mt-4">
                    <Link href={item.link} className="text-[#0275f2] hover:underline">
                      {item.linkText}
                    </Link>
                  </div>
                )}
              </div>
            }
            header={
              <div className="flex items-center justify-center h-full relative">
                {typeof item.value === 'number' || typeof item.value === 'string' ? (
                  <span className="text-6xl font-bold text-[#0275f2]">{item.value}</span>
                ) : (
                  item.value
                )}
                {item.refreshButton}
              </div>
            }
            icon={item.icon}
            className={cn("[&>p:text-lg]", item.className, "shadow-md shadow-blue-200 hover:shadow-blue-200")}
          />
        ))}
      </BentoGrid>
    </div>
  );
});

export default Dashboard;