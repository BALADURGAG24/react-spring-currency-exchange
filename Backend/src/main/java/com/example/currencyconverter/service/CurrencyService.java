package com.example.currencyconverter.service;

import com.example.currencyconverter.model.CurrencyResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
public class CurrencyService {

    private final RestTemplate rt = new RestTemplate();

    private static final String LATEST_API = "https://api.exchangerate-api.com/v4/latest/";
    private static final String HISTORICAL_API = "https://api.exchangerate.host/timeseries";

    /**
     * Convert amount from one currency to another.
     */
    public double convertCurrency(String from, String to, double amount) {
        CurrencyResponse response = getCurrencyRates(from);
        Double rate = response.getRates().get(to);
        return rate != null ? rate * amount : 0.0;
    }

    /**
     * Get current exchange rates for the base currency.
     */
    public CurrencyResponse getCurrencyRates(String base) {
        return rt.getForObject(LATEST_API + base, CurrencyResponse.class);
    }

    /**
     * Get historical exchange rate data for the past 7 days.
     */
    public List<Map<String, Object>> getHistoricalRates(String from, String to) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        String url = String.format(
                "%s?start_date=%s&end_date=%s&base=%s&symbols=%s",
                HISTORICAL_API,
                startDate,
                endDate,
                from,
                to
        );

        Map<String, Object> response = rt.getForObject(url, Map.class);
        if (response == null || !response.containsKey("rates")) {
            return Collections.emptyList();
        }

        Map<String, Map<String, Double>> rates = (Map<String, Map<String, Double>>) response.get("rates");
        List<Map<String, Object>> result = new ArrayList<>();

        for (String date : rates.keySet()) {
            Double rate = rates.get(date).get(to);
            if (rate != null) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("date", date);
                entry.put("rate", rate);
                result.add(entry);
            }
        }

        result.sort(Comparator.comparing(m -> m.get("date").toString()));
        return result;
    }
}
