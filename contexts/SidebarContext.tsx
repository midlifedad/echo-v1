'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SidebarContextType, Client } from '@/lib/types';
import { CLIENTS } from '@/lib/constants';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client>(CLIENTS[0]);
  const [activeSection, setActiveSection] = useState('editor');

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-state');
    if (saved) {
      const state = JSON.parse(saved);
      setIsCollapsed(state.isCollapsed || false);
      // Find client by ID to get latest data from CLIENTS
      const savedClientId = state.selectedClient?.id;
      const matchedClient = CLIENTS.find(c => c.id === savedClientId);
      setSelectedClient(matchedClient || CLIENTS[0]);
    }
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-state', JSON.stringify({
      isCollapsed: newCollapsed,
      selectedClient
    }));
  };

  const setHovered = (hovered: boolean) => {
    setIsHovered(hovered);
  };

  const handleSetSelectedClient = (client: Client) => {
    setSelectedClient(client);
    localStorage.setItem('sidebar-state', JSON.stringify({
      isCollapsed,
      selectedClient: client
    }));
  };

  const value: SidebarContextType = {
    isCollapsed,
    isHovered,
    selectedClient,
    activeSection,
    toggleSidebar,
    setHovered,
    setSelectedClient: handleSetSelectedClient,
    setActiveSection,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}