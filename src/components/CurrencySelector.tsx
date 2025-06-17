
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
import { ChevronDown, DollarSign } from 'lucide-react';

const CurrencySelector = () => {
  const { selectedCurrency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>{selectedCurrency.code}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setCurrency(currency)}
            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{currency.symbol}</span>
              <span className="text-sm">{currency.name}</span>
            </div>
            {selectedCurrency.code === currency.code && (
              <Badge variant="secondary" className="text-xs">Selected</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
