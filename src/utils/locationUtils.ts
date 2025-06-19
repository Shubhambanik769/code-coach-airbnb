
export interface LocationData {
  country: string;
  countryCode: string;
  currency: string;
}

// Currency mapping based on country codes
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'US': 'USD',
  'CA': 'CAD',
  'GB': 'GBP',
  'AU': 'AUD',
  'SG': 'SGD',
  'IN': 'INR',
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'FI': 'EUR',
  'IE': 'EUR',
  'PT': 'EUR',
  'GR': 'EUR',
  'LU': 'EUR',
  'MT': 'EUR',
  'CY': 'EUR',
  'SK': 'EUR',
  'SI': 'EUR',
  'EE': 'EUR',
  'LV': 'EUR',
  'LT': 'EUR',
};

export const detectUserLocation = async (): Promise<LocationData | null> => {
  try {
    // Try to get location using IP-based geolocation API
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location');
    
    const data = await response.json();
    
    if (data.error) {
      console.warn('Location detection error:', data.reason);
      return null;
    }

    const countryCode = data.country_code?.toUpperCase();
    const currency = countryCode ? COUNTRY_CURRENCY_MAP[countryCode] || 'USD' : 'USD';

    return {
      country: data.country_name || 'Unknown',
      countryCode: countryCode || 'US',
      currency
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
};

export const getCurrencyByCountryCode = (countryCode: string): string => {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD';
};
