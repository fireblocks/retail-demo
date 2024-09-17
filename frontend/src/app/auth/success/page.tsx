"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authStore from "@/store/authStore";
import terminalStore from "@/store/terminalStore";
import LoadingAnimation from "@/components/LoadingAnimation";

const AuthSuccess = () => {
  const router = useRouter();
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';

  useEffect(() => {
    async function fetchUser() {
      try {
        await authStore.fetchUser();
        if (authStore.user) {
          const timestamp = new Date().toISOString();
          terminalStore.addLog(`${timestamp}: User logged in: ${authStore.user.email}`);
          setIsUserFetched(true);
        } else {
          throw new Error("User not found after fetch");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    }

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (isUserFetched && isAnimationComplete) {
      router.push("/dashboard");
    }
  }, [isUserFetched, isAnimationComplete, router]);

  const handleAnimationComplete = () => {
    setIsAnimationComplete(true);
  };

  return (
    <div 
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundColor: "#fffefe",
        backgroundImage: `url(${basePath}/background.svg)`,
        backgroundRepeat: "repeat",
        backgroundSize: "20px 20px",
        backgroundPosition: "top left",
        backgroundAttachment: "fixed"
      }}
    >
      <LoadingAnimation onAnimationComplete={handleAnimationComplete} />
    </div>
  );
};

export default AuthSuccess;
