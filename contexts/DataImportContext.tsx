'use client';

/**
 * Data Import Context
 * Manages global state for data import workflow
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  ImportSession,
  ImportStatus,
  ImportStep,
  ImportedDataset,
  DataPreview,
  VisualizationRecommendation,
  ImportError,
  DataColumn
} from '@/lib/types/dataImport';
import { dataImportDB } from '@/lib/data-import/database';

interface DataImportContextValue {
  // Current session state
  session: ImportSession | null;
  isImporting: boolean;

  // Dataset management
  currentDataset: ImportedDataset | null;
  dataPreview: DataPreview | null;
  recommendations: VisualizationRecommendation[] | null;

  // Actions
  startImport: (source: 'csv' | 'paste') => void;
  cancelImport: () => void;
  setImportStep: (step: ImportStep) => void;
  setImportStatus: (status: ImportStatus) => void;

  // Data operations
  uploadFile: (file: File) => Promise<void>;
  pasteData: (data: string) => Promise<void>;
  confirmImport: () => Promise<void>;
  generateRecommendations: () => Promise<void>;
  selectRecommendation: (recommendationId: string) => void;

  // Dataset management
  loadDataset: (datasetId: string) => Promise<void>;
  deleteDataset: (datasetId: string) => Promise<void>;
  clearCurrentDataset: () => void;

  // Error handling
  errors: ImportError[];
  clearErrors: () => void;
  addError: (error: ImportError) => void;
}

const DataImportContext = createContext<DataImportContextValue | undefined>(undefined);

export function useDataImport() {
  const context = useContext(DataImportContext);
  if (!context) {
    throw new Error('useDataImport must be used within DataImportProvider');
  }
  return context;
}

interface DataImportProviderProps {
  children: ReactNode;
}

export function DataImportProvider({ children }: DataImportProviderProps) {
  const [session, setSession] = useState<ImportSession | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<ImportedDataset | null>(null);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [recommendations, setRecommendations] = useState<VisualizationRecommendation[] | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);

  // Initialize database on mount
  useEffect(() => {
    const initDB = async () => {
      try {
        await dataImportDB.init();
        // Try to restore any incomplete session
        const existingSession = await dataImportDB.getCurrentSession();
        if (existingSession) {
          setSession(existingSession);
        }
      } catch (error) {
        console.error('Failed to initialize data import database:', error);
        addError({
          code: 'DB_INIT_ERROR',
          message: 'Failed to initialize storage',
          severity: 'error',
          timestamp: new Date()
        });
      }
    };

    initDB();
  }, []);

  const startImport = useCallback((source: 'csv' | 'paste') => {
    const newSession: ImportSession = {
      id: `session-${Date.now()}`,
      status: ImportStatus.IDLE,
      currentStep: ImportStep.SELECT_SOURCE,
      errors: [],
      startedAt: new Date(),
      timestamp: new Date(),
      source: source === 'csv' ? 'file' : 'paste',
      rawData: []
    };

    setSession(newSession);
    setIsImporting(true);
    setErrors([]);
    setDataPreview(null);
    setRecommendations(null);

    // Save session to database
    dataImportDB.saveSession(newSession).catch(console.error);
  }, []);

  const cancelImport = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        status: ImportStatus.IDLE,
        completedAt: new Date()
      };
      setSession(updatedSession);
      dataImportDB.saveSession(updatedSession).catch(console.error);
    }

    setIsImporting(false);
    setDataPreview(null);
    setErrors([]);
  }, [session]);

  const setImportStep = useCallback((step: ImportStep) => {
    if (session) {
      const updatedSession = { ...session, currentStep: step };
      setSession(updatedSession);
      dataImportDB.saveSession(updatedSession).catch(console.error);
    }
  }, [session]);

  const setImportStatus = useCallback((status: ImportStatus) => {
    if (session) {
      const updatedSession = { ...session, status };
      setSession(updatedSession);
      dataImportDB.saveSession(updatedSession).catch(console.error);
    }
  }, [session]);

  const uploadFile = useCallback(async (file: File) => {
    if (!session) {
      throw new Error('No active import session');
    }

    try {
      setImportStatus(ImportStatus.UPLOADING);

      // File size validation
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // TODO: Implement actual file upload logic
      // This will be implemented when we create the CSV parser service

      setImportStatus(ImportStatus.PARSING);
      // Parse CSV...

      setImportStatus(ImportStatus.VALIDATING);
      // Validate data...

      setImportStatus(ImportStatus.GENERATING_PREVIEW);
      // Generate preview...

      setImportStatus(ImportStatus.AWAITING_CONFIRMATION);
      setImportStep(ImportStep.PREVIEW_DATA);
    } catch (error) {
      addError({
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        severity: 'error',
        timestamp: new Date()
      });
      setImportStatus(ImportStatus.FAILED);
    }
  }, [session, setImportStatus, setImportStep]);

  const pasteData = useCallback(async (data: string) => {
    if (!session) {
      throw new Error('No active import session');
    }

    try {
      setImportStatus(ImportStatus.PARSING);

      // TODO: Implement actual paste data parsing logic
      // This will be implemented when we create the clipboard handler service

      setImportStatus(ImportStatus.VALIDATING);
      // Validate data...

      setImportStatus(ImportStatus.GENERATING_PREVIEW);
      // Generate preview...

      setImportStatus(ImportStatus.AWAITING_CONFIRMATION);
      setImportStep(ImportStep.PREVIEW_DATA);
    } catch (error) {
      addError({
        code: 'PASTE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to parse pasted data',
        severity: 'error',
        timestamp: new Date()
      });
      setImportStatus(ImportStatus.FAILED);
    }
  }, [session, setImportStatus, setImportStep]);

  const confirmImport = useCallback(async () => {
    if (!session || !dataPreview) {
      throw new Error('No data to import');
    }

    try {
      setImportStatus(ImportStatus.STORING);

      // TODO: Save dataset to database
      // This will be implemented with the storage manager

      setImportStep(ImportStep.VIEW_RECOMMENDATIONS);
      await generateRecommendations();
    } catch (error) {
      addError({
        code: 'CONFIRM_ERROR',
        message: error instanceof Error ? error.message : 'Failed to confirm import',
        severity: 'error',
        timestamp: new Date()
      });
      setImportStatus(ImportStatus.FAILED);
    }
  }, [session, dataPreview, setImportStatus, setImportStep]);

  const generateRecommendations = useCallback(async () => {
    if (!currentDataset) {
      throw new Error('No dataset available for recommendations');
    }

    try {
      setImportStatus(ImportStatus.GENERATING_RECOMMENDATIONS);

      // TODO: Call chart-mcp server for recommendations
      // This will be implemented with the chart-mcp client service

      setImportStatus(ImportStatus.COMPLETE);
    } catch (error) {
      addError({
        code: 'RECOMMENDATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate recommendations',
        severity: 'warning',
        timestamp: new Date()
      });
    }
  }, [currentDataset, setImportStatus]);

  const selectRecommendation = useCallback((recommendationId: string) => {
    if (!recommendations) return;

    const selected = recommendations.find(r => r.id === recommendationId);
    if (selected) {
      // Update recommendations to mark selected
      const updated = recommendations.map(r => ({
        ...r,
        selected: r.id === recommendationId
      }));
      setRecommendations(updated);
      setImportStep(ImportStep.CREATE_VISUALIZATION);
    }
  }, [recommendations, setImportStep]);

  const loadDataset = useCallback(async (datasetId: string) => {
    try {
      const dataset = await dataImportDB.getDataset(datasetId);
      if (dataset) {
        setCurrentDataset(dataset);

        // Load associated recommendations if any
        const recs = await dataImportDB.getRecommendations(datasetId);
        if (recs.length > 0) {
          setRecommendations(recs);
        }
      } else {
        throw new Error('Dataset not found');
      }
    } catch (error) {
      addError({
        code: 'LOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to load dataset',
        severity: 'error',
        timestamp: new Date()
      });
    }
  }, []);

  const deleteDataset = useCallback(async (datasetId: string) => {
    try {
      await dataImportDB.deleteDataset(datasetId);

      // Clear current dataset if it's the one being deleted
      if (currentDataset?.id === datasetId) {
        clearCurrentDataset();
      }
    } catch (error) {
      addError({
        code: 'DELETE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete dataset',
        severity: 'error',
        timestamp: new Date()
      });
    }
  }, [currentDataset]);

  const clearCurrentDataset = useCallback(() => {
    setCurrentDataset(null);
    setDataPreview(null);
    setRecommendations(null);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((error: ImportError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const value: DataImportContextValue = {
    session,
    isImporting,
    currentDataset,
    dataPreview,
    recommendations,
    startImport,
    cancelImport,
    setImportStep,
    setImportStatus,
    uploadFile,
    pasteData,
    confirmImport,
    generateRecommendations,
    selectRecommendation,
    loadDataset,
    deleteDataset,
    clearCurrentDataset,
    errors,
    clearErrors,
    addError
  };

  return (
    <DataImportContext.Provider value={value}>
      {children}
    </DataImportContext.Provider>
  );
}