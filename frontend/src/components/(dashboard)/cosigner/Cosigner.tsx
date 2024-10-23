"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/foundation/button';
import { motion, AnimatePresence } from 'framer-motion';
import transactionStore from '@/store/transactionStore';

const Cosigner: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean[]>([]);

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

  const fetchEndpoint = async (endpoint: string, index: number) => {
    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      let response;
      switch (endpoint) {
        case 'getCosigners':
          response = await transactionStore.getCosigners();
          break;
        case 'getCosigner':
          response = await transactionStore.getCosigner();
          break;
        case 'getApiKeys':
        case 'getApiKey':
          // TODO: implement these endpoints
          response = await transactionStore.getCosigner();
          break;
        default:
          throw new Error('Invalid endpoint');
      }
      setResponses((prev) => {
        const newResponses = [...prev];
        newResponses[index] = JSON.stringify(response, null, 2);
        return newResponses;
      });
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    } finally {
      setLoading(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Fireblocks Cosigner API
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-xl text-gray-500">
          Explore the Cosigner API
        </p>
      </motion.div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="text-center mb-8"
          >
            <h2 className="text-primary text-3xl font-bold">Welcome to Cosigner API Tutorial!</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cosignerEndpoints.map((endpoint, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-lg flex flex-col h-[300px] justify-between overflow-hidden"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">{endpoint.title}</h3>
              <Button
                onClick={() => fetchEndpoint(endpoint.endpoint, index)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out relative"
                disabled={loading[index]}
              >
                {loading[index] ? (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  </motion.div>
                ) : (
                  'Run GET Request'
                )}
              </Button>
            </div>
            <div className="mt-4 flex-1 overflow-hidden">
              <pre className="text-sm overflow-y-auto h-full scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700">
                {responses[index] || 'No response yet.'}
              </pre>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Cosigner;
