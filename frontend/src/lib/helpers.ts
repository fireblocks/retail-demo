export const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    
    const formatted = num.toString().replace(/\.?0+$/, "");
    
    return formatted.includes('.') ? formatted : num.toFixed(0);
  };