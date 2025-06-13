"use client";

import { useState } from "react";
import { searchStocks } from "@/lib/alphaVantageApi";
import { StockSearchResult } from "@/types/stock";
import styles from "./StockSearch.module.css";

interface StockSearchProps {
  onStockSelect: (symbol: string, name: string) => void;
}

export default function StockSearch({ onStockSelect }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchStocks(searchTerm);
      setSearchResults(response.bestMatches || []);

      if (!response.bestMatches || response.bestMatches.length === 0) {
        setError("No stocks found for this search term");
      }
    } catch (err) {
      setError("Failed to search stocks. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStockSelect = (result: StockSearchResult) => {
    onStockSelect(result["1. symbol"], result["2. name"]);
    setSearchResults([]);
    setSearchTerm("");
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>Stock Tracker</h1>
        <p className={styles.subtitle}>Search and track your favorite stocks</p>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter company name or stock symbol (e.g., Apple, AAPL)"
          className={styles.searchInput}
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchTerm.trim()}
          className={styles.searchButton}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Search Results</h3>
          <div className={styles.resultsList}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={styles.resultItem}
                onClick={() => handleStockSelect(result)}
              >
                <div className={styles.symbolSection}>
                  <span className={styles.symbol}>{result["1. symbol"]}</span>
                  <span className={styles.type}>{result["3. type"]}</span>
                </div>
                <div className={styles.nameSection}>
                  <span className={styles.name}>{result["2. name"]}</span>
                  <span className={styles.region}>
                    {result["4. region"]} • {result["8. currency"]}
                  </span>
                </div>
                <div className={styles.matchScore}>
                  {(parseFloat(result["9. matchScore"]) * 100).toFixed(0)}%
                  match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
