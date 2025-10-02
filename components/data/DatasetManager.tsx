/**
 * Dataset Manager Component
 * Manages stored datasets with list, preview, and delete functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  FileText,
  Trash2,
  Eye,
  Download,
  Search,
  AlertCircle,
  Calendar,
  HardDrive,
  Loader2
} from 'lucide-react';
import { DatasetListItem, DatasetPreview, StorageQuota } from '@/lib/types/dataset';
import { datasetStorage } from '@/lib/services/datasetStorage';
import { csvParser } from '@/lib/services/csvParser';
import { sanitizeDatasetMetadata, sanitizeUserInput } from '@/lib/utils/domSanitizer';
import { scanForCSVInjection, getCSVInjectionWarning } from '@/lib/utils/csvSanitizer';

interface DatasetManagerProps {
  onSelectDataset?: (dataset: DatasetPreview) => void;
  selectionMode?: boolean;
}

export default function DatasetManager({
  onSelectDataset,
  selectionMode = false
}: DatasetManagerProps) {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<DatasetListItem | null>(null);
  const [previewData, setPreviewData] = useState<DatasetPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadDatasets();
    loadStorageInfo();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await datasetStorage.listDatasets({
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setDatasets(result.datasets);
    } catch (err) {
      console.error('Failed to load datasets:', err);
      setError('Failed to load datasets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const quota = await datasetStorage.getStorageQuota();
      setStorageQuota(quota);
    } catch (err) {
      console.error('Failed to load storage info:', err);
    }
  };

  const handlePreview = async (dataset: DatasetListItem) => {
    try {
      setSelectedDataset(dataset);
      const preview = await datasetStorage.getDatasetPreview(dataset.id);
      if (preview) {
        setPreviewData(preview);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Failed to load preview:', err);
      setError('Failed to load dataset preview.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDataset) return;

    try {
      setDeleteLoading(true);
      await datasetStorage.deleteDataset(selectedDataset.id);
      setShowDeleteConfirm(false);
      setSelectedDataset(null);
      await loadDatasets();
      await loadStorageInfo();
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      setError('Failed to delete dataset.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async (dataset: DatasetListItem) => {
    try {
      const fullDataset = await datasetStorage.get(dataset.id);
      if (!fullDataset) return;

      // Scan for CSV injection attempts
      const suspicious = scanForCSVInjection(fullDataset.data);
      if (suspicious.length > 0) {
        const warning = getCSVInjectionWarning(suspicious.length);
        console.warn('CSV Injection Detection:', warning, suspicious);
        // Note: CSV will be sanitized automatically by csvParser.toCSV
      }

      const csv = csvParser.toCSV({
        data: fullDataset.data.slice(1).map((row, i) => {
          const obj: any = {};
          fullDataset.data[0].forEach((header: any, j: number) => {
            obj[header] = row[j];
          });
          return obj;
        }),
        errors: [],
        meta: {
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: false,
          fields: fullDataset.data[0]
        }
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export dataset:', err);
      setError('Failed to export dataset.');
    }
  };

  const handleSelect = () => {
    if (previewData && onSelectDataset) {
      onSelectDataset(previewData);
      setShowPreview(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Stored Datasets</CardTitle>
          </div>
          {storageQuota && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatBytes(storageQuota.usage)} / {formatBytes(storageQuota.quota)}
                </span>
              </div>
              <Badge variant="outline">
                {storageQuota.datasets} / {storageQuota.maxDatasets} datasets
              </Badge>
            </div>
          )}
        </div>
        <CardDescription>
          Manage your imported datasets. Select a dataset to use for chart generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Datasets Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No datasets found matching your search.' : 'No datasets stored yet.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{sanitizeDatasetMetadata(dataset.name)}</p>
                            {dataset.description && (
                              <p className="text-xs text-muted-foreground">
                                {sanitizeDatasetMetadata(dataset.description)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{dataset.rowCount.toLocaleString()}</TableCell>
                      <TableCell>{dataset.columnCount}</TableCell>
                      <TableCell>{formatBytes(dataset.sizeBytes || 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(dataset.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(dataset)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(dataset)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDataset(dataset);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewData?.name ? sanitizeDatasetMetadata(previewData.name) : ''}</DialogTitle>
            <DialogDescription>
              Preview of first 10 rows • Total: {previewData?.totalRows.toLocaleString()} rows
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] border rounded">
            {previewData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.columns.map((col, i) => (
                      <TableHead key={i}>
                        <div>
                          <p>{sanitizeDatasetMetadata(col.name)}</p>
                          <Badge variant="outline" className="text-xs">
                            {col.dataType}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.slice(1).map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>
                          {cell !== null && cell !== undefined ? sanitizeUserInput(cell) : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            {selectionMode && onSelectDataset && (
              <Button onClick={handleSelect}>
                Use This Dataset
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDataset?.name ? sanitizeDatasetMetadata(selectedDataset.name) : ''}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}