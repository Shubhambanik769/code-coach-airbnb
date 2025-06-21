
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export const currencies: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 }, // INR as base currency
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.010 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.009 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 0.015 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.016 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 0.016 },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency, isManual?: boolean) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with INR as default
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, []);

  const setCurrency = (currency: Currency, isManual: boolean = false) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency.code);
    
    // Track if this was a manual selection
    if (isManual) {
      localStorage.setItem('manualCurrencySelection', 'true');
    }
  };

  const convertPrice = (price: number): number => {
    if (!price || !selectedCurrency?.rate) return 0;
    return Math.round(price * selectedCurrency.rate * 100) / 100;
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setCurrency,
      convertPrice,
      formatPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
