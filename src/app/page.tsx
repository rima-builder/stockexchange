"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import StockDetails from "@/components/StockDetails";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
  } | null>(null);

  const handleStockSelect = (symbol: string, name: string) => {
    setSelectedStock({ symbol, name });
  };

  const handleBack = () => {
    setSelectedStock(null);
  };

  return (
    <main>
      {selectedStock ? (
        <StockDetails
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          onBack={handleBack}
        />
      ) : (
        <StockSearch onStockSelect={handleStockSelect} />
      )}
    </main>
  );
}
