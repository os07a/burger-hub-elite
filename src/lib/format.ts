// Latin (Arabic-numeral system used in English) number formatting — e.g. 123,456
export const fmt = (n: number, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 0 }) =>
  Number(n || 0).toLocaleString("en-US", opts);

export const fmtPct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;
