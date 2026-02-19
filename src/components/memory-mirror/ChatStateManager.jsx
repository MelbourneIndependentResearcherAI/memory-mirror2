import { useState, useEffect, useCallback } from 'react';
import { useAppState } from '@/components/AppStateManager';

// Custom hook for managing chat state with persistence
export const useChatState = (componentId = 'chatInterface') => {
  const { saveComponentState, getComponentState } = useAppState();
  
  const savedState = getComponentState(componentId, {
    messages: [],
    conversationHistory: [],
    selectedEra: 'auto',
    detectedEra: 'present',
    anxietyState: { level: 0, suggestedMode: null }
  });

  const [messages, setMessages] = useState(savedState.messages);
  const [conversationHistory, setConversationHistory] = useState(savedState.conversationHistory);
  const [selectedEra, setSelectedEra] = useState(savedState.selectedEra);
  const [detectedEra, setDetectedEra] = useState(savedState.detectedEra);
  const [anxietyState, setAnxietyState] = useState(savedState.anxietyState);

  // Auto-save state on changes
  useEffect(() => {
    const stateToSave = {
      messages,
      conversationHistory,
      selectedEra,
      detectedEra,
      anxietyState,
      lastUpdated: Date.now()
    };
    saveComponentState(componentId, stateToSave);
  }, [messages, conversationHistory, selectedEra, detectedEra, anxietyState, componentId, saveComponentState]);

  return {
    messages,
    setMessages,
    conversationHistory,
    setConversationHistory,
    selectedEra,
    setSelectedEra,
    detectedEra,
    setDetectedEra,
    anxietyState,
    setAnxietyState
  };
};