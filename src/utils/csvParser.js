import Papa from 'papaparse';

/**
 * Auto-detect column mapping by scanning headers for keywords.
 * Returns { yearCol, revenueCol, cogsCol, inventoryCol } or null if can't detect.
 */
export function autoDetectColumns(headers) {
  const lower = headers.map((h) => h.toLowerCase().trim());

  const yearPatterns = ['year', 'period', 'fy', 'date'];
  const revenuePatterns = ['revenue', 'sales', 'net sales', 'turnover'];
  const cogsPatterns = ['cogs', 'cost of goods', 'cost of materials', 'material cost', 'total expenses'];
  const inventoryPatterns = ['inventory', 'inventories', 'total inventory', 'stock'];

  const find = (patterns) => lower.findIndex((h) => patterns.some((p) => h.includes(p)));

  const yearCol = find(yearPatterns);
  const revenueCol = find(revenuePatterns);
  const cogsCol = find(cogsPatterns);
  const inventoryCol = find(inventoryPatterns);

  if (yearCol === -1 || revenueCol === -1 || inventoryCol === -1) return null;

  return { yearCol, revenueCol, cogsCol: cogsCol === -1 ? null : cogsCol, inventoryCol };
}

/**
 * Parse tab/comma-separated text into { headers, rows }.
 */
export function parseCSVText(text) {
  if (!text || !text.trim()) return { error: 'No data provided' };

  // Detect delimiter: tab or comma
  const firstLine = text.trim().split('\n')[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const result = Papa.parse(text.trim(), {
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    return { error: 'Could not parse data: ' + result.errors[0].message };
  }

  const rows = result.data;
  if (rows.length < 2) return { error: 'Need at least a header row and one data row' };

  return {
    headers: rows[0].map((h) => h.trim()),
    rows: rows.slice(1).map((row) => row.map((cell) => cell.trim())),
  };
}

/**
 * Parse a CSV/Excel file using PapaParse.
 * Returns a promise of { headers, rows } or { error }.
 */
export function parseCSVFile(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          resolve({ error: 'Could not parse file: ' + result.errors[0].message });
          return;
        }
        const rows = result.data;
        if (rows.length < 2) {
          resolve({ error: 'Need at least a header row and one data row' });
          return;
        }
        resolve({
          headers: rows[0].map((h) => String(h).trim()),
          rows: rows.slice(1).map((row) => row.map((cell) => String(cell).trim())),
        });
      },
      error: (err) => {
        resolve({ error: 'File parsing failed: ' + err.message });
      },
    });
  });
}

/**
 * Extract structured years data from parsed rows + column mapping.
 * Returns array of { year, revenue, cogs, inventory }.
 */
export function extractYearsData(rows, columnMap) {
  const { yearCol, revenueCol, cogsCol, inventoryCol } = columnMap;

  return rows
    .map((row) => {
      const year = row[yearCol] || '';
      const revenue = parseNum(row[revenueCol]);
      const cogs = cogsCol != null ? parseNum(row[cogsCol]) : null;
      const inventory = parseNum(row[inventoryCol]);
      if (!year || revenue == null) return null;
      return { year, revenue, cogs, inventory };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by year string (handles FY21, 2021, etc.)
      const na = parseInt(a.year.replace(/\D/g, ''));
      const nb = parseInt(b.year.replace(/\D/g, ''));
      return na - nb;
    });
}

function parseNum(str) {
  if (str == null || str === '') return null;
  const cleaned = str.replace(/[,\s]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}
