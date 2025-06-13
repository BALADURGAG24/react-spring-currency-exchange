import React from 'react';
import '../css/RatesTable.css';

const RatesTable = ({ rates }) => {
  return (
    <div className="rates-table-container">
      <table className="rates-table">
        <thead>
          <tr>
            <th>Currency</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rates).map(([currency, rate]) => (
            <tr key={currency}>
              <td>{currency}</td>
              <td>{rate.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RatesTable;
