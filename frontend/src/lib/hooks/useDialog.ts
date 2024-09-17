import { useState } from "react";

export const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(prev => !prev);
  return { isOpen, toggle };
};