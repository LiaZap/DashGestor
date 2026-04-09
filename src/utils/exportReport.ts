/**
 * Export utilities for dashboard reports (CSV & PDF).
 */

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR');
  }
  const str = String(value);
  // Escape quotes and wrap in quotes if the value contains commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getDateStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTimestamp(): string {
  return new Date().toLocaleString('pt-BR');
}

/**
 * Export an array of objects as a CSV file and trigger a browser download.
 *
 * @param data - Array of row objects
 * @param filename - Base filename (date will be appended, e.g. "campanhas_2024-03-15.csv")
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  const csvRows: string[] = [
    headers.join(';'), // pt-BR convention uses semicolon as separator
    ...data.map((row) =>
      headers.map((h) => formatValue(row[h])).join(';'),
    ),
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // BOM for Excel pt-BR
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const fullFilename = `${filename}_${getDateStamp()}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export data as a styled PDF using the browser print dialog via a hidden iframe.
 *
 * @param title - Report title displayed in the header
 * @param data - Array of row objects
 * @param columns - Array of column keys to include (in order)
 */
export function exportToPDF(
  title: string,
  data: Record<string, unknown>[],
  columns: string[],
): void {
  if (data.length === 0) return;

  const timestamp = getTimestamp();

  const tableRows = data
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td>${formatValue(row[col])}</td>`).join('')}</tr>`,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${title} - GestorDash</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #ccc;
      padding: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(255, 215, 0, 0.2);
    }
    .brand {
      font-size: 22px;
      font-weight: 700;
      color: #ffd700;
      letter-spacing: -0.5px;
    }
    .report-title {
      font-size: 16px;
      color: #e0e0e0;
      font-weight: 600;
      margin-top: 4px;
    }
    .timestamp {
      font-size: 11px;
      color: #888;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      text-align: left;
      padding: 10px 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #999;
      border-bottom: 1px solid rgba(255, 215, 0, 0.15);
      background: #111;
    }
    td {
      padding: 9px 12px;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #ccc;
    }
    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }
    @media print {
      body { background: #fff; color: #222; padding: 16px; }
      .header { border-bottom-color: #ffd700; }
      .brand { color: #b8960f; }
      .report-title { color: #333; }
      .timestamp { color: #666; }
      th { background: #f5f5f5; color: #444; border-bottom-color: #ddd; }
      td { color: #333; border-bottom-color: #eee; }
      tr:nth-child(even) { background: #fafafa; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">GestorDash</div>
      <div class="report-title">${title}</div>
    </div>
    <div class="timestamp">Gerado em: ${timestamp}</div>
  </div>
  <table>
    <thead>
      <tr>
        ${columns.map((col) => `<th>${col}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for content to render then trigger print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Cleanup after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
