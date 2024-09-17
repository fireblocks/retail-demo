"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/foundation/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconWallet,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
import Link from "next/link";
import authStore from "@/store/authStore";

export default function MySidebar() {
  const baseUrl = "http://localhost:3001";
  const links = [
    {
      label: "Dashboard",
      href: `${baseUrl}/dashboard`,
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Wallet",
      href: `${baseUrl}/wallet`,
      icon: (
        <IconWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Transactions",
      href: `${baseUrl}/transactions`,
      icon: (
        <IconSwitchHorizontal className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        authStore.logout();
      },
    },
  ];

  const [_, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 h-screen">
      <Sidebar open={true} setOpen={setOpen}>
        <SidebarBody className="flex flex-col justify-between h-full">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden text-xl">
            {<Logo />}
            <div className="mt-8 flex flex-col gap-2 ml-5">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} onClick={link.onClick} className="text-xl" />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link href="#" className="font-normal flex flex-col mr-10">
      <div className="h-5 w-6" />
      <div className="items-center justify-center align-center self-center mb-2">
        <span className="text-3xl text-primary mt-3 font-bold">FireX</span>
      </div>
      <div className="w-30 relative">
        <div className="absolute inset-x-4 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px]  blur-lg" />
        <div className="absolute inset-x-2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />
        <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[3px] w-1/2 blur-sm" />
        <div className="absolute inset-x-40 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/8" />
      </div>
    </Link>
  );
};