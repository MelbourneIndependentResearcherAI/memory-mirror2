import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TabStackContext = createContext();

export const useTabStack = () => {
  const context = useContext(TabStackContext);
  if (!context) {
    throw new Error('useTabStack must be used within TabStackProvider');
  }
  return context;
};

export const TabStackProvider = ({ children }) => {
  // Maps tab path to its navigation history stack
  const [tabStacks, setTabStacks] = useState({});
  // Tracks the current tab
  const currentTabRef = useRef(null);
  const location = useLocation();

  const pushTab = useCallback((tabPath) => {
    currentTabRef.current = tabPath;
    setTabStacks(prev => {
      const stack = prev[tabPath] || [];
      // Add to stack only if it's not already the most recent entry
      if (stack[stack.length - 1] !== tabPath) {
        return {
          ...prev,
          [tabPath]: [...stack, tabPath]
        };
      }
      return prev;
    });
  }, []);

  const getPreviousTab = useCallback(() => {
    const currentTab = currentTabRef.current;
    if (!currentTab) return null;
    
    const stack = tabStacks[currentTab] || [];
    // Return the second-to-last tab in the stack (previous tab)
    if (stack.length > 1) {
      return stack[stack.length - 2];
    }
    return null;
  }, [tabStacks]);

  return (
    <TabStackContext.Provider
      value={{
        pushTab,
        getPreviousTab,
        currentTab: currentTabRef.current
      }}
    >
      {children}
    </TabStackContext.Provider>
  );
};