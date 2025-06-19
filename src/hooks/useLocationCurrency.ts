
import { useState, useEffect } from 'react';
import { detectUserLocation, LocationData } from '@/utils/locationUtils';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';

export const useLocationCurrency = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setCurrency } = useCurrency();

  const detectAndSetCurrency = async () => {
    // Check if user has already manually selected a currency
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const hasManualSelection = localStorage.getItem('manualCurrencySelection');
    
    if (savedCurrency && hasManualSelection) {
      console.log('User has manually selected currency, skipping auto-detection');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const location = await detectUserLocation();
      
      if (location) {
        setLocationData(location);
        
        // Find the matching currency from our supported currencies
        const matchingCurrency = currencies.find(
          currency => currency.code === location.currency
        );

        if (matchingCurrency) {
          setCurrency(matchingCurrency);
          console.log(`Auto-detected currency: ${location.currency} for ${location.country}`);
        } else {
          console.warn(`Currency ${location.currency} not supported, defaulting to USD`);
          const usdCurrency = currencies.find(currency => currency.code === 'USD');
          if (usdCurrency) setCurrency(usdCurrency);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect location';
      setError(errorMessage);
      console.error('Location currency detection failed:', errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    detectAndSetCurrency();
  }, []);

  return {
    isDetecting,
    locationData,
    error,
    detectAndSetCurrency
  };
};
