// services/currencyService.ts

let exchangeRates: Record<string, number> = {};
let baseCurrency = "USD";
let isLoading = false;

export async function fetchExchangeRates(base = "USD", symbols?: string[]) {
  try {
    if (isLoading) {
      console.log("Exchange rates are already being fetched...");
      return;
    }
    
    isLoading = true;
    baseCurrency = base;
    
    // Try multiple API endpoints for better reliability
    const apiEndpoints = [
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      `https://api.fxratesapi.com/latest?base=${baseCurrency}`,
      `https://api.exchangerate.host/latest?base=${baseCurrency}`
    ];
    
    if (symbols && symbols.length > 0) {
      const symbolsQuery = symbols.join(",");
      apiEndpoints[0] += `?symbols=${symbolsQuery}`;
      apiEndpoints[1] += `&symbols=${symbolsQuery}`;
      apiEndpoints[2] += `&symbols=${symbolsQuery}`;
    }
    
    let data = null;
    let lastError = null;
    
    // Try each API endpoint until one works
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Trying API endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        data = await response.json();
        console.log("API Response:", data);
        
        // Check if the response has the expected structure
        if (data && data.rates && typeof data.rates === 'object') {
          exchangeRates = data.rates;
          console.log("Rates fetched successfully:", baseCurrency, exchangeRates);
          isLoading = false;
          return;
        }
        
        throw new Error("Invalid data structure from API");
        
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}:`, err);
        lastError = err;
        continue;
      }
    }
    
    // If all APIs failed, use fallback rates
    console.warn("All exchange rate APIs failed, using fallback rates");
    exchangeRates = getFallbackRates(baseCurrency);
    
  } catch (err) {
    console.error("Error fetching exchange rates:", err);
    // Use fallback rates if API fails
    exchangeRates = getFallbackRates(baseCurrency);
  } finally {
    isLoading = false;
  }
}

// Fallback exchange rates (approximate values - update as needed)
function getFallbackRates(base: string): Record<string, number> {
  const fallbackRates: Record<string, Record<string, number>> = {
    USD: {
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      TND: 3.1 // Tunisian Dinar
    },
    EUR: {
      USD: 1.18,
      GBP: 0.86,
      JPY: 129.0,
      CAD: 1.47,
      AUD: 1.59,
      CHF: 1.08,
      CNY: 7.6,
      TND: 3.65
    },
    TND: {
      USD: 0.32,
      EUR: 0.27,
      GBP: 0.23,
      JPY: 35.5,
      CAD: 0.40,
      AUD: 0.43,
      CHF: 0.30,
      CNY: 2.08
    }
  };
  
  return fallbackRates[base] || fallbackRates.USD;
}

export function convertCurrency(from: string, to: string, amount: number): number {
  if (from === to) return amount;
  
  // Check if exchange rates are loaded
  if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
    console.warn("Exchange rates not loaded, using fallback rates");
    exchangeRates = getFallbackRates(baseCurrency);
  }
  
  try {
    // Handle conversion from base currency
    if (from === baseCurrency) {
      if (!exchangeRates[to]) {
        throw new Error(`No exchange rate found for target currency: ${to}`);
      }
      return amount * exchangeRates[to];
    }
    
    // Handle conversion to base currency
    if (to === baseCurrency) {
      if (!exchangeRates[from]) {
        throw new Error(`No exchange rate found for source currency: ${from}`);
      }
      return amount / exchangeRates[from];
    }
    
    // Handle conversion between two non-base currencies
    if (!exchangeRates[from] || !exchangeRates[to]) {
      const missingCurrency = !exchangeRates[from] ? from : to;
      throw new Error(`No exchange rate found for currency: ${missingCurrency}`);
    }
    
    // Convert from -> base -> to
    const amountInBase = amount / exchangeRates[from];
    return amountInBase * exchangeRates[to];
    
  } catch (error) {
    console.error("Currency conversion error:", error);
    // Return original amount if conversion fails
    return amount;
  }
}

// Helper function to check if rates are loaded
export function areRatesLoaded(): boolean {
  return exchangeRates && Object.keys(exchangeRates).length > 0;
}

// Helper function to get available currencies
export function getAvailableCurrencies(): string[] {
  return [baseCurrency, ...Object.keys(exchangeRates)];
}

// Helper function to manually set exchange rates (for testing)
export function setExchangeRates(rates: Record<string, number>, base = "USD") {
  exchangeRates = rates;
  baseCurrency = base;
}