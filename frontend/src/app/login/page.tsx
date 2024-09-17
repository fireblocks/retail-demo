"use client";

import { useState } from "react";
import { observer } from "mobx-react-lite";
import authStore from "../../store/authStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/foundation/card";
import { Label } from "@/foundation/label";
import { Input } from "@/foundation/input";
import { Button } from "@/foundation/button";
import { Separator } from "@/foundation/separator";
import { FaGoogle } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import terminalStore from "../../store/terminalStore";
import { useRouter } from "next/navigation";
import { SparklesPreview } from "@/components/login/Sparkles";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const timestamp = new Date();

const LoginPage = observer(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setUserName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success: boolean | undefined = false;
    try {
      if (isSignup) {
        const user = await authStore.signup({ email, password, name });
        success = !!user;
        if (success) {
          terminalStore.addLog(
            `${timestamp.toISOString()}: User signed up: ${user.email}`
          );
        }
      } else {
        const user = await authStore.login({ email, password });
        success = !!user;
      }
    } catch (error: any) {
      terminalStore.addLog(`Error: ${error.message}`);
    }

    if (success) {
      router.push("/auth/success");
    }
  };
  return (
    <SparklesPreview>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex mx-auto max-w-4xl w-full bg-card rounded-lg overflow-hidden shadow-even shadow-[#2463eb6b]">
          <div className="flex flex-col w-1/2 border-r border-border p-6">
            <CardHeader className="flex flex-col text-center align-center items-center space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                {isSignup ? "Sign Up" : "Login"}
              </CardTitle>
              <CardDescription>
                Enter your email and password to{" "}
                {isSignup ? "create an account" : "login to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={authStore.loading}
                >
                  {isSignup ? "Sign Up" : "Login"}
                </Button>
                {authStore.error && (
                  <p className="text-red-500 mt-2">{authStore.error}</p>
                )}
              </form>
              {!isSignup && (
                <>
                  <div className="my-4">
                    <Separator />
                    <p className="text-center text-sm text-gray-500 my-2">
                      Or Continue With:
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => authStore.loginWithGoogle()}>
                      <FaGoogle className="mr-2" size={20} />
                      Google
                    </Button>
                    <Button onClick={() => authStore.loginWithGitHub()} disabled>
                      <FaGithub className="mr-2" size={20} />
                      GitHub
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <div className="mt-6 text-center">
              {isSignup ? (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => setIsSignup(false)}
                  >
                    Login
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Don{"apos;'`t"} have an account?
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign Up
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center w-1/2 p-8 bg-card">
            <div className="flex-col items-center align-center mb-12">
              <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-primary relative mb-2">
                FireX
              </h1>
              <div className="w-30 relative">
                <div className="absolute inset-x-4 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] blur-sm" />
                <div className="absolute inset-x-4 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[3px] w-1/2 blur-sm" />
                <div className="absolute inset-x-40 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
              </div>
            </div>
            <p className="text-xl font-semibold text-center mt-12">
              <span className="text-primary">Build your retail platform </span>
              <span className="text-blue-800">effortlessly, quickly,</span>
              <span className="text-primary"> and </span>
              <span className="text-blue-800">securely </span>
              <span className="text-primary">with Fireblocks</span>
            </p>
          </div>
        </div>
      </div>
    </SparklesPreview>
  );
});

export default LoginPage;
