export const DATA_IMPORT_CONFIG = {
  maxFileSize: 10, // MB
  allowedFormats: ['csv', 'tsv', 'txt'],
  maxRows: 10000,
  maxColumns: 100,
  chunkSize: 1000,
  previewRows: 10,
  
  validation: {
    minRows: 2, // At least header + 1 data row
    minColumns: 1,
    maxEmptyRows: 100,
    maxErrorsToShow: 10,
  },
  
  parsing: {
    delimiter: 'auto', // auto-detect
    skipEmptyLines: true,
    dynamicTyping: true,
    header: true,
    transformHeader: (header: string) => header.trim(),
  },
  
  chartDefaults: {
    minDataPoints: 2,
    maxSeriesForChart: 10,
    defaultChartHeight: 400,
  }
};