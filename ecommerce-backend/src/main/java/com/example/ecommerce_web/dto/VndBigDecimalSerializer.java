package com.example.ecommerce_web.dto;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;

public class VndBigDecimalSerializer extends JsonSerializer<BigDecimal> {

    private static final DecimalFormat formatter = new DecimalFormat("#,###");

    @Override
    public void serialize(BigDecimal value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value != null) {
            gen.writeNumber(value.longValue()); // số nguyên VND
        } else {
            gen.writeNull();
        }
    }

}
