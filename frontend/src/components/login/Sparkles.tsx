"use client";
import React, { useMemo } from "react";
import { SparklesCore } from "@/foundation/sparkles";

const particleOptions = {
  background: "transparent",
  minSize: 0.6,
  maxSize: 2,
  particleDensity: 120,
  particleColor: "#2463eb",
};

const SparklesPreview = React.memo(function SparklesPreview({ children }: { children: React.ReactNode }) {
  const memoizedSparkles = useMemo(() => (
    <SparklesCore
      id="tsparticlesfullpage"
      className="w-full h-full"
      {...particleOptions}
    />
  ), []);

  return (
    <div className="h-full relative w-full bg-white flex flex-col items-center justify-center rounded-md">
      <div className="w-full absolute inset-0 h-screen z-0">
        {memoizedSparkles}
      </div>
      <div className="relative z-5">
        {children}
      </div>
    </div>
  );
});

SparklesPreview.displayName = 'SparklesPreview';

export { SparklesPreview };
