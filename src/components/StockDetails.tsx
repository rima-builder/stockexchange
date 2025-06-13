"use client";

import { useState, useEffect } from "react";
import { getStockQuote } from "@/lib/alphaVantageApi";
import { ProcessedStockData } from "@/types/stock";
import styles from "./StockDetails.module.css";

interface StockDetailsProps {
  symbol: string;
  name: string;
  onBack: () => void;
}

export default function StockDetails({
  symbol,
  name,
  onBack,
}: StockDetailsProps) {
  const [stockData, setStockData] = useState<ProcessedStockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getStockQuote(symbol);
        setStockData({ ...data, name }); // Update with the actual company name
      } catch (err) {
        setError("Failed to fetch stock data. Please try again.");
        console.error("Stock data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, name]);

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatVolume = (volume: string) => {
    const num = parseInt(volume);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Search
        </button>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className={styles.container}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Search
        </button>
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error || "No stock data available"}</p>
          <button onClick={onBack} className={styles.tryAgainButton}>
            Try Another Stock
          </button>
        </div>
      </div>
    );
  }

  const isPositive = parseFloat(stockData.change) >= 0;

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        ← Back to Search
      </button>

      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.stockSymbol}>{stockData.symbol}</h1>
          <h2 className={styles.stockName}>{stockData.name}</h2>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.currentPrice}>
            ${formatNumber(stockData.currentPrice)}
          </div>
          <div
            className={`${styles.changeContainer} ${isPositive ? styles.positive : styles.negative}`}
          >
            <span className={styles.changeAmount}>
              {isPositive ? "+" : ""}${stockData.change}
            </span>
            <span className={styles.changePercent}>
              ({isPositive ? "+" : ""}
              {stockData.changePercent}%)
            </span>
          </div>
        </div>
      </div>

      <div className={styles.lastUpdated}>
        Last updated: {new Date(stockData.lastRefreshed).toLocaleString()}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Open</div>
          <div className={styles.metricValue}>
            ${formatNumber(stockData.open)}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>High</div>
          <div className={styles.metricValue}>
            ${formatNumber(stockData.high)}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Low</div>
          <div className={styles.metricValue}>
            ${formatNumber(stockData.low)}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Previous Close</div>
          <div className={styles.metricValue}>
            ${formatNumber(stockData.previousClose)}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Volume</div>
          <div className={styles.metricValue}>
            {formatVolume(stockData.volume)}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Day Range</div>
          <div className={styles.metricValue}>
            ${formatNumber(stockData.low)} - ${formatNumber(stockData.high)}
          </div>
        </div>
      </div>

      <div className={styles.refreshSection}>
        <button
          onClick={() => window.location.reload()}
          className={styles.refreshButton}
        >
          🔄 Refresh Data
        </button>
        <p className={styles.disclaimer}>
          Data provided by Alpha Vantage. Market data may be delayed.
        </p>
      </div>
    </div>
  );
}
