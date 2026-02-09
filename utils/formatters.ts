export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) return '—';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hr' : `${hours} hrs`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

export function formatPhoneNumber(phone: string | null, countryCode: string | null = null): string {
  if (!phone) return '—';
  
  const prefix = countryCode ? `+${countryCode} ` : '';
  return `${prefix}${phone}`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function formatAddress(
  street: string | null,
  city: string | null,
  province: string | null,
  country: string | null,
  postalCode: string | null
): string {
  const parts = [street, city, province, postalCode, country].filter(Boolean);
  return parts.join(', ') || '—';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatStatus(status: string): string {
  return status.split('_').map(capitalize).join(' ');
}
