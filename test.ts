/**
 * ========================================
 * 
 * SH1106 - TEST NADPISYWANIA TEKSTU
 * 
 * micro:bit V2 - MakeCode JavaScript
 * 
 * ========================================
 */
let licznik = 0
let temperatura = 0
serial.redirectToUSB()
serial.writeLine("START TESTU SH1106")
// Inicjalizacja
sh1106.init()
// Stale napisy
sh1106.text("TEST SH1106", 0, 0)
sh1106.text("TEMPERATURA:", 0, 2)
sh1106.text("LICZNIK:", 0, 4)
sh1106.text("STATUS:", 0, 6)
// Ramka wokol ekranu
sh1106.rectangle(
    0,
    0,
    128,
    64,
    false
)
sh1106.show()
basic.forever(function () {
    // Aktualizacja temperatury
    temperatura = input.temperature()
    sh1106.text("" + temperatura + " C", 13, 2)
    // Aktualizacja licznika
    sh1106.text("" + licznik, 10, 4)
    // Test napisow o roznej dlugosci
    if (licznik % 2 == 0) {
        sh1106.text("DZIALA", 9, 6)
    } else {
        sh1106.text("OK", 9, 6)
    }
    serial.writeLine("TEMP=" + temperatura + " LICZNIK=" + licznik)
    licznik += 1
    basic.pause(1000)
})
