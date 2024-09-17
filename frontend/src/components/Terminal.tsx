"use client";

import React, { useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import terminalStore from "../store/terminalStore";
import { Button } from "@/foundation/button";
import { Resizable } from "re-resizable";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

const Terminal = observer(({ isMinimized, onToggleMinimize }: { isMinimized: boolean, onToggleMinimize: () => void }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const resizableRef = useRef(null);

  const buttonClass = "bg-transparent mr-2";
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-black text-green-400 z-50`}
      style={{ height: isMinimized ? '40px' : undefined }}
    >
      <div className="flex justify-between items-center bg-primary">
        <span className="ml-4 text-white">Console</span>
        <Button onClick={onToggleMinimize} className={buttonClass}>
          {isMinimized ? <FaAngleUp /> : <FaAngleDown />}
        </Button>
      </div>
      {!isMinimized && (
        <Resizable
          ref={resizableRef}
          defaultSize={{
            width: "100%",
            height: 200,
          }}
          minHeight={50}
          maxHeight={800}
          enable={{
            top: true,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          className="bg-black overflow-hidden"
          onResize={() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          }}
        >
          <div ref={terminalRef} className="overflow-auto h-full p-2">
            {terminalStore.logs.map((log, index) => (
              <div key={index}>{log + '\n'}</div>
            ))}
          </div>
        </Resizable>
      )}
    </div>
  );
});

export default Terminal;
