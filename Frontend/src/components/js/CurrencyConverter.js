// CurrencyConverter.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RatesTable from './RatesTable';
import RateChart from './RateChart';
import '../css/CurrencyConverter.css';

const currencySymbols = {
  USD: "$", EUR: "€", INR: "₹", GBP: "£", JPY: "¥",
  AUD: "$", CAD: "$", CHF: "Fr", CNY: "¥", SEK: "kr", NZD: "$"
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [converted, setConverted] = useState(null);
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => fetchRates(), 300000);
    return () => clearInterval(interval);
  }, [fromCurrency]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchRates = () => {
    axios.get(`http://localhost:8080/api/rates/${fromCurrency}`)
      .then(res => {
        setRates(res.data.rates);
        setCurrencies(Object.keys(res.data.rates));
      })
      .catch(() => alert("Error fetching currency rates"));

    axios.get(`http://localhost:8080/api/history?from=${fromCurrency}&to=${toCurrency}`)
      .then(res => setHistoryData(res.data))
      .catch(() => {});
  };

  const handleConvert = () => {
    axios.get(`http://localhost:8080/api/convert`, {
      params: { from: fromCurrency, to: toCurrency, amount }
    })
      .then(res => {
        setConverted(res.data);
        setConversionHistory(prev => [...prev.slice(-4), {
          amount, from: fromCurrency, to: toCurrency, result: res.data
        }]);
      })
      .catch(() => alert("Conversion failed"));
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const toggleFavorite = (cur) => {
    setFavorites(prev => prev.includes(cur) ? prev.filter(f => f !== cur) : [...prev, cur]);
  };

  return (
    <div className="currency-converter">
      <h2 className="converter-header">🌍 Currency Converter</h2>
      <button onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="converter-controls">
        <input type="number" value={amount} min="0" onChange={e => setAmount(e.target.value)} />

        <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
          {[...favorites, ...currencies.filter(c => !favorites.includes(c))].map(cur => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>

        <button className="swap-button" onClick={handleSwap}>🔁</button>

        <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
          {[...favorites, ...currencies.filter(c => !favorites.includes(c))].map(cur => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>

        <button onClick={handleConvert}>Convert</button>
      </div>

      {converted !== null && (
        <p className="conversion-result">
          {currencySymbols[fromCurrency]}{amount} {fromCurrency} = {currencySymbols[toCurrency]}{converted.toFixed(2)} {toCurrency}
        </p>
      )}

      <h3 className="rates-title">📊 Current Rates for {fromCurrency}</h3>
      <RatesTable rates={rates} favorites={favorites} toggleFavorite={toggleFavorite} />

      <RateChart data={historyData} />

      {conversionHistory.length > 0 && (
        <>
          <h3 className="history-title">📜 Conversion History</h3>
          <ul className="conversion-history">
            {conversionHistory.map((entry, idx) => (
              <li key={idx}>
                {currencySymbols[entry.from]}{entry.amount} {entry.from} → {entry.to} = {currencySymbols[entry.to]}{entry.result.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CurrencyConverter;
