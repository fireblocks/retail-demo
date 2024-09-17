"use client";

import MySidebar from "@/components/Sidebar";
import Terminal from "@/components/Terminal";
import { useState } from "react";
import NotificationBar from "@/components/(dashboard)/NotificationBar";
import { PageHero } from "@/components/PageHero";
import 'dotenv/config';

const PostLogin = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="flex min-h-screen relative">
      <div className="z-20">
        <MySidebar />
      </div>

      <div className="flex-grow flex flex-col relative ml-64"> 
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(/background.svg)`,
            backgroundRepeat: "repeat",
            backgroundSize: "20px 20px",
            backgroundPosition: "top left",
            backgroundAttachment: "fixed",
            opacity: 0.8,
          }}
        />
        <PageHero title={title} />
        <div
          className={`flex-grow flex flex-col ${
            isMinimized ? "pb-10" : "pb-56"
          } overflow-auto items-center`}
          style={{
            backgroundColor: "rgba(255, 254, 254, 0.5)",
            minHeight: "calc(90vh - 56px)",
          }}
        >
          <div className="relative z-10 w-full h-full flex flex-col items-center">
            {children}
          </div>
        </div>
      </div>
      <NotificationBar />
      <Terminal
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />
    </div>
  );
};

export default PostLogin;
