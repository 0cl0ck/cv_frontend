const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export const formatPrice = (value: number): string => {
  if (!Number.isFinite(value)) return euroFormatter.format(0);
  return euroFormatter.format(value);
};

