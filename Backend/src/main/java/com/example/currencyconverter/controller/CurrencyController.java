package com.example.currencyconverter.controller;

import com.example.currencyconverter.model.CurrencyResponse;
import com.example.currencyconverter.service.CurrencyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CurrencyController {

    private final CurrencyService service;

    public CurrencyController(CurrencyService service) {
        this.service = service;
    }

    @GetMapping("/convert")
    public double convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam double amount
    ) {
        return service.convertCurrency(from.toUpperCase(), to.toUpperCase(), amount);
    }

    @GetMapping("/rates/{base}")
    public CurrencyResponse getRates(@PathVariable String base) {
        return service.getCurrencyRates(base.toUpperCase());
    }

    @GetMapping("/history")
    public List<Map<String, Object>> getHistory(
            @RequestParam String from,
            @RequestParam String to
    ) {
        return service.getHistoricalRates(from.toUpperCase(), to.toUpperCase());
    }
}
