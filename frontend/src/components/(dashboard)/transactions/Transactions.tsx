"use client";

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import transactionStore from "@/store/transactionStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/foundation/table";
import { IconChevronDown, IconChevronUp, IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/foundation/button";
import { parseDate } from "@/lib/helpers";
import React from 'react';

const Transactions = observer(() => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const transactions = transactionStore.getTransactions();
    if (transactions.length === 0) {
      transactionStore.fetchTransactions();
    }
  }, []);

  const toggleRowExpansion = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'text-primary';
      case 'processing': return 'text-orange-500';
      case 'failed': return 'text-red-500';
      case 'completed': return 'text-green-700';
      default: return '';
    }
  };

  const tableHeaders = ["Type", "Date", "Asset ID", "Amount", "Status", ""];

  const formatDate = (dateString: string | number) => {
    const date = parseDate(dateString);
    return date.toLocaleString(); // This will display both date and time
    // If you only want the date, use: return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {transactionStore.transactions.length > 0 ? (
        <Table>
          <TableHeader className="bg-white border-x-0 border-y-0 hover:bg-white">
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header} className="text-center text-primary">{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="border border-x-blue-100 border-r-0 border-l-0">
            {transactionStore.transactions.map((transaction) => (
              <React.Fragment key={transaction.fireblocksTxId}>
                <TableRow className="text-primary">
                  <TableCell className="text-center">
                    {transaction.outgoing ? 
                      <IconArrowUp size={20} className="text-red-500 mx-auto" /> : 
                      <IconArrowDown size={20} className="text-green-500 mx-auto" />
                    }
                  </TableCell>
                  <TableCell className="text-center">{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell className="text-center">{transaction.assetId}</TableCell>
                  <TableCell className="text-center">{transaction.amount}</TableCell>
                  <TableCell className={`text-center ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => toggleRowExpansion(transaction.fireblocksTxId)}
                    >
                      {expandedRows.has(transaction.fireblocksTxId) ? (
                        <IconChevronUp size={20} />
                      ) : (
                        <IconChevronDown size={20} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(transaction.fireblocksTxId) && (
                  <TableRow key={`${transaction.fireblocksTxId}-expanded`}>
                    <TableCell colSpan={5}>
                      <div className="p-4 bg-gray-50 text-primary">
                        <p><strong>Fireblocks Transaction ID:</strong> {transaction.fireblocksTxId}</p>
                        <p><strong>Transaction Hash:</strong> {transaction.txHash}</p>
                        <p><strong>Destination Address:</strong> {transaction.destinationExternalAddress}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8">No Transactions</div>
      )}
    </div>
  );
});

export default Transactions;