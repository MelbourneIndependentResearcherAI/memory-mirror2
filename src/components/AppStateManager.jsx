import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Global state manager for preserving component states across route changes
const AppStateContext = createContext(null);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [componentStates, setComponentStates] = useState({});
  const [scrollPositions, setScrollPositions] = useState({});
  const location = useLocation();

  // Save scroll position before route change
  useEffect(() => {
    const saveScrollPosition = () => {
      setScrollPositions(prev => ({
        ...prev,
        [location.pathname]: {
          x: window.scrollX,
          y: window.scrollY
        }
      }));
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [location.pathname]);

  // Restore scroll position after route change
  useEffect(() => {
    const savedPosition = scrollPositions[location.pathname];
    if (savedPosition) {
      window.scrollTo(savedPosition.x, savedPosition.y);
    }
  }, [location.pathname, scrollPositions]);

  const saveComponentState = (componentId, state) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: state
    }));
  };

  const getComponentState = (componentId, defaultState = {}) => {
    return componentStates[componentId] || defaultState;
  };

  const clearComponentState = (componentId) => {
    setComponentStates(prev => {
      const newStates = { ...prev };
      delete newStates[componentId];
      return newStates;
    });
  };

  const value = {
    saveComponentState,
    getComponentState,
    clearComponentState,
    componentStates,
    scrollPositions
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};