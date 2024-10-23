"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/foundation/button';
import { motion, AnimatePresence } from 'framer-motion';
import transactionStore from '@/store/transactionStore';

const Cosigner: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [responses, setResponses] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const cosignerEndpoints = [
    {
      title: 'Get All Cosigners',
      endpoint: 'getCosigners',
    },
    {
      title: 'Get Cosigner',
      endpoint: 'getCosigner',
    },
    {
      title: 'Get All API Keys',
      endpoint: 'getApiKeys',
    },
    {
      title: 'Get API Key',
      endpoint: 'getApiKey',
    },
  ];

  const fetchEndpoint = async (endpoint: string) => {
    try {
      let response;
      switch (endpoint) {
        case 'getCosigners':
          response = await transactionStore.getCosignerData();
          break;
        case 'getCosigner':
          response = await transactionStore.getCosigner();
          break;
        case 'getApiKeys':
        // TODO: implement this
        //     response = await transactionStore.getApiKeys();
        response = await transactionStore.getCosigner();

          break;
        case 'getApiKey':
            // TODO: implement this
          // response = await transactionStore.getApiKey();
          response = await transactionStore.getCosigner();

          break;
        default:
          throw new Error('Invalid endpoint');
      }
      setResponses((prev) => {
        const newResponses = [...prev];
        const index = cosignerEndpoints.findIndex(e => e.endpoint === endpoint);
        newResponses[index] = JSON.stringify(response, null, 2);
        return newResponses;
      });
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Fireblocks Cosigner API
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Explore the Cosigner API
        </p>
      </motion.div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="text-center mb-12"
          >
            <h2 className="text-primary text-3xl font-bold">Welcome to Cosigner API Tutorial!</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col space-y-4">
        {cosignerEndpoints.map((endpoint, index) => (
          <div
            key={index}
            className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-md flex flex-col h-[300px] w-[800px] justify-between overflow-hidden"
          >
            <h3 className="text-2xl font-bold">{endpoint.title}</h3>
            <Button
              onClick={() => fetchEndpoint(endpoint.endpoint)}
              className="mt-2 bg-green-500 text-white rounded-md"
            >
              Run GET Request
            </Button>
            <pre className="mt-3 overflow-x-auto flex-1 break-words text-sm">{responses[index] || 'No response yet.'}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cosigner;
