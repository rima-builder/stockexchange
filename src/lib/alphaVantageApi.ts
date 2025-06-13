import {
  StockSearchResponse,
  StockTimeSeriesResponse,
  StockIntradayResponse,
  ProcessedStockData,
} from "@/types/stock";

const API_KEY = "HU0P0HWTMH23EP19";
const BASE_URL = "https://www.alphavantage.co/query";

export async function searchStocks(
  keywords: string,
): Promise<StockSearchResponse> {
  const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to search stocks");
  }

  const data = await response.json();
  return data;
}

export async function getStockQuote(
  symbol: string,
): Promise<ProcessedStockData> {
  // Get both daily and intraday data for comprehensive information
  const [dailyData, intradayData] = await Promise.all([
    getStockDaily(symbol),
    getStockIntraday(symbol),
  ]);

  // Get the latest daily data
  const dailyTimeSeries = dailyData["Time Series (Daily)"];
  const dailyDates = Object.keys(dailyTimeSeries).sort().reverse();
  const latestDailyDate = dailyDates[0];
  const previousDailyDate = dailyDates[1];
  const latestDaily = dailyTimeSeries[latestDailyDate];
  const previousDaily = dailyTimeSeries[previousDailyDate];

  // Get the latest intraday data for current price
  const intradayTimeSeries = intradayData["Time Series (5min)"];
  const intradayTimestamps = Object.keys(intradayTimeSeries).sort().reverse();
  const latestIntraday = intradayTimeSeries[intradayTimestamps[0]];

  // Calculate change and change percentage
  const currentPrice = parseFloat(latestIntraday["4. close"]);
  const previousClose = parseFloat(previousDaily["4. close"]);
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  return {
    symbol: dailyData["Meta Data"]["2. Symbol"],
    name: dailyData["Meta Data"]["2. Symbol"], // We'll update this with search data if available
    currentPrice: latestIntraday["4. close"],
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    open: latestDaily["1. open"],
    high: latestDaily["2. high"],
    low: latestDaily["3. low"],
    volume: latestDaily["5. volume"],
    lastRefreshed: intradayData["Meta Data"]["3. Last Refreshed"],
    previousClose: previousDaily["4. close"],
  };
}

async function getStockDaily(symbol: string): Promise<StockTimeSeriesResponse> {
  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch daily stock data");
  }

  const data = await response.json();

  if (data["Error Message"]) {
    throw new Error("Invalid stock symbol");
  }

  return data;
}

async function getStockIntraday(
  symbol: string,
): Promise<StockIntradayResponse> {
  const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch intraday stock data");
  }

  const data = await response.json();

  if (data["Error Message"]) {
    throw new Error("Invalid stock symbol");
  }

  return data;
}
