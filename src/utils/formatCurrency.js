export function formatCr(value) {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1) {
    const formatted = value % 1 === 0
      ? value.toLocaleString('en-IN')
      : value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `₹${formatted} Cr`;
  }
  // Show in lakhs for small numbers
  const lakhs = value * 100;
  if (lakhs >= 1) {
    return `₹${lakhs.toFixed(1)} L`;
  }
  return `₹${value.toFixed(2)} Cr`;
}

export function formatPct(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatDays(value) {
  if (value == null || isNaN(value)) return '—';
  return `${Math.round(value)} days`;
}
