package com.pos.backend.domain.valueobject;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    @Test
    void testCreation() {
        Money m1 = Money.of(10.5);
        assertEquals(new BigDecimal("10.50"), m1.getAmount());

        Money m2 = Money.of("20.00");
        assertEquals(new BigDecimal("20.00"), m2.getAmount());
    }

    @Test
    void testAddition() {
        Money m1 = Money.of("10.50");
        Money m2 = Money.of("5.25");
        Money result = m1.add(m2);
        assertEquals(Money.of("15.75"), result);
    }

    @Test
    void testSubtraction() {
        Money m1 = Money.of("10.50");
        Money m2 = Money.of("5.25");
        Money result = m1.subtract(m2);
        assertEquals(Money.of("5.25"), result);
    }

    @Test
    void testMultiplication() {
        Money m1 = Money.of("10.50");
        Money result = m1.multiply(3);
        assertEquals(Money.of("31.50"), result);
    }

    @Test
    void testEquality() {
        Money m1 = Money.of("10.50");
        Money m2 = Money.of("10.5");
        assertEquals(m1, m2);
    }

    @Test
    void testNullAmount() {
        assertThrows(IllegalArgumentException.class, () -> new Money(null));
    }
}
