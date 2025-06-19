
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import { useLocationCurrency } from '@/hooks/useLocationCurrency';
import { ChevronDown, DollarSign, MapPin, Loader2 } from 'lucide-react';

const CurrencySelector = () => {
  const { selectedCurrency, setCurrency } = useCurrency();
  const { isDetecting, locationData } = useLocationCurrency();

  // Ensure we have a valid currency selected
  const currentCurrency = selectedCurrency || currencies[0];

  const handleCurrencySelect = (currency: typeof currencies[0]) => {
    setCurrency(currency, true); // Mark as manual selection
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4" />
          )}
          <span>{currentCurrency.code}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
        {locationData && (
          <div className="px-3 py-2 text-xs text-gray-500 border-b flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Detected: {locationData.country}</span>
          </div>
        )}
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencySelect(currency)}
            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{currency.symbol}</span>
              <span className="text-sm">{currency.name}</span>
            </div>
            {currentCurrency.code === currency.code && (
              <Badge variant="secondary" className="text-xs">Selected</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
