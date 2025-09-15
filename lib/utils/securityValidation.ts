export function validateFileFormat(file: File, allowedFormats: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension ? allowedFormats.includes(fileExtension) : false;
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function sanitizeInput(input: string): string {
  // Remove potential script tags and dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function validateCSVContent(content: string): boolean {
  // Basic CSV validation
  if (!content || content.trim().length === 0) {
    return false;
  }
  
  // Check for at least one line with data
  const lines = content.trim().split('\n');
  return lines.length > 0;
}

export function sanitizeCellValue(value: any): any {
  if (typeof value === 'string') {
    return sanitizeInput(value);
  }
  return value;
}