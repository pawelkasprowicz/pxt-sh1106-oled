/**
 * SH1106 OLED 128x64
 * MakeCode extension for micro:bit V2
 * I2C address: 0x3C
 */
//% color="#2675A6" icon="\uf108" block="SH1106 OLED"
namespace sh1106 {

    const ADDRESS = 0x3C
    const WIDTH = 128
    const HEIGHT = 64
    const BUFFER_SIZE = 1024

    let framebuffer = pins.createBuffer(BUFFER_SIZE)
    let displayed = pins.createBuffer(BUFFER_SIZE)

    let initialized = false

    // Zapamietana dlugosc tekstu w kazdej pozycji
    // 8 wierszy x 21 kolumn
    let textLengths: number[] = []

    for (let i = 0; i < 168; i++) {
        textLengths.push(0)
    }

    // ----------------------------------------
    // I2C
    // ----------------------------------------

    function command(cmd: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = cmd
        pins.i2cWriteBuffer(ADDRESS, buf, false)
    }

    function sendData(data: Buffer): void {
        let buf = pins.createBuffer(data.length + 1)
        buf[0] = 0x40

        for (let i = 0; i < data.length; i++) {
            buf[i + 1] = data[i]
        }

        pins.i2cWriteBuffer(ADDRESS, buf, false)
    }

    // ----------------------------------------
    // Adresowanie SH1106
    // ----------------------------------------

    function setPosition(page: number, column: number): void {
        let col = column + 2

        command(0xB0 + page)
        command(0x00 + (col & 0x0F))
        command(0x10 + (col >> 4))
    }

    // ----------------------------------------
    // Inicjalizacja
    // ----------------------------------------

    /**
     * Inicjalizuje wyswietlacz.
     */
    //% block="inicjalizuj OLED"
    //% weight=100
    export function init(): void {

        command(0xAE)

        command(0xD5)
        command(0x80)

        command(0xA8)
        command(0x3F)

        command(0xD3)
        command(0x00)

        command(0x40)

        command(0xAD)
        command(0x8B)

        command(0xA1)
        command(0xC8)

        command(0xDA)
        command(0x12)

        command(0x81)
        command(0x80)

        command(0xD9)
        command(0x1F)

        command(0xDB)
        command(0x40)

        command(0xA4)
        command(0xA6)

        command(0xAF)

        initialized = true

        clear()
        show()
    }

    // ----------------------------------------
    // Bufor
    // ----------------------------------------

    /**
     * Czysci bufor obrazu.
     */
    //% block="wyczysc OLED"
    //% weight=90
    export function clear(): void {

        for (let i = 0; i < BUFFER_SIZE; i++) {
            framebuffer[i] = 0
        }

        for (let i = 0; i < 168; i++) {
            textLengths[i] = 0
        }
    }

    /**
     * Pelne odswiezenie wyswietlacza.
     */
    //% block="pokaz obraz OLED"
    //% weight=80
    export function show(): void {

        if (!initialized) {
            return
        }

        for (let page = 0; page < 8; page++) {

            setPosition(page, 0)

            for (let x = 0; x < 128; x += 16) {

                let data = pins.createBuffer(16)

                for (let i = 0; i < 16; i++) {
                    let index = page * 128 + x + i
                    data[i] = framebuffer[index]
                    displayed[index] = framebuffer[index]
                }

                sendData(data)
            }
        }
    }

    /**
     * Odswieza tylko zmienione bajty.
     */
    //% block="pokaz zmiany OLED"
    //% weight=75
    export function showChanged(): void {

        if (!initialized) {
            return
        }

        for (let page = 0; page < 8; page++) {

            let x = 0

            while (x < 128) {

                let index = page * 128 + x

                if (framebuffer[index] == displayed[index]) {
                    x++
                    continue
                }

                let start = x
                let count = 0

                while (x < 128 && count < 16) {

                    index = page * 128 + x

                    if (framebuffer[index] == displayed[index]) {
                        break
                    }

                    x++
                    count++
                }

                setPosition(page, start)

                let data = pins.createBuffer(count)

                for (let i = 0; i < count; i++) {
                    index = page * 128 + start + i
                    data[i] = framebuffer[index]
                    displayed[index] = framebuffer[index]
                }

                sendData(data)
            }
        }
    }

    // ----------------------------------------
    // Piksele
    // ----------------------------------------

    function setPixel(x: number, y: number, on: boolean): void {

        if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
            return
        }

        let page = Math.idiv(y, 8)
        let index = page * WIDTH + x
        let mask = 1 << (y % 8)

        if (on) {
            framebuffer[index] |= mask
        } else {
            framebuffer[index] &= ~mask
        }
    }

    /**
     * Rysuje lub gasi piksel.
     */
    //% block="piksel OLED X %x Y %y wlacz %on"
    //% weight=70
    export function pixel(x: number, y: number, on: boolean = true): void {
        setPixel(x, y, on)
    }

    // ----------------------------------------
    // Linia
    // ----------------------------------------

    /**
     * Rysuje linie.
     */
    //% block="linia OLED X1 %x0 Y1 %y0 X2 %x1 Y2 %y1"
    //% weight=60
    export function line(
        x0: number,
        y0: number,
        x1: number,
        y1: number
    ): void {

        let dx = Math.abs(x1 - x0)
        let dy = Math.abs(y1 - y0)

        let sx = x0 < x1 ? 1 : -1
        let sy = y0 < y1 ? 1 : -1

        let err = dx - dy

        while (true) {

            setPixel(x0, y0, true)

            if (x0 == x1 && y0 == y1) {
                break
            }

            let e2 = 2 * err

            if (e2 > -dy) {
                err -= dy
                x0 += sx
            }

            if (e2 < dx) {
                err += dx
                y0 += sy
            }
        }
    }

    // ----------------------------------------
    // Prostokat
    // ----------------------------------------

    /**
     * Rysuje prostokat.
     */
    //% block="prostokat OLED X %x Y %y szerokosc %w wysokosc %h wypelnij %fill"
    //% weight=50
    export function rectangle(
        x: number,
        y: number,
        w: number,
        h: number,
        fill: boolean
    ): void {

        if (w <= 0 || h <= 0) {
            return
        }

        if (fill) {

            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++) {
                    setPixel(xx, yy, true)
                }
            }

        } else {

            line(x, y, x + w - 1, y)
            line(x, y, x, y + h - 1)
            line(x + w - 1, y, x + w - 1, y + h - 1)
            line(x, y + h - 1, x + w - 1, y + h - 1)
        }
    }

    // ----------------------------------------
    // Okrag
    // ----------------------------------------

    /**
     * Rysuje okrag.
     */
    //% block="okrag OLED X %cx Y %cy promien %r wypelnij %fill"
    //% weight=40
    export function circle(
        cx: number,
        cy: number,
        r: number,
        fill: boolean
    ): void {

        if (r < 0) {
            return
        }

        let x = r
        let y = 0
        let err = 1 - r

        while (x >= y) {

            if (fill) {

                line(cx - x, cy + y, cx + x, cy + y)
                line(cx - x, cy - y, cx + x, cy - y)
                line(cx - y, cy + x, cx + y, cy + x)
                line(cx - y, cy - x, cx + y, cy - x)

            } else {

                setPixel(cx + x, cy + y, true)
                setPixel(cx + y, cy + x, true)
                setPixel(cx - y, cy + x, true)
                setPixel(cx - x, cy + y, true)

                setPixel(cx - x, cy - y, true)
                setPixel(cx - y, cy - x, true)
                setPixel(cx + y, cy - x, true)
                setPixel(cx + x, cy - y, true)
            }

            y++

            if (err < 0) {
                err += 2 * y + 1
            } else {
                x--
                err += 2 * (y - x) + 1
            }
        }
    }

    // ----------------------------------------
    // Czcionka 5x7
    // ----------------------------------------

    function font(ch: string): number[] {

        let c = ch.charCodeAt(0)

        // Cyfry 0-9
        const digits: number[][] = [
            [0x3E, 0x51, 0x49, 0x45, 0x3E],
            [0x00, 0x42, 0x7F, 0x40, 0x00],
            [0x42, 0x61, 0x51, 0x49, 0x46],
            [0x21, 0x41, 0x45, 0x4B, 0x31],
            [0x18, 0x14, 0x12, 0x7F, 0x10],
            [0x27, 0x45, 0x45, 0x45, 0x39],
            [0x3C, 0x4A, 0x49, 0x49, 0x30],
            [0x01, 0x71, 0x09, 0x05, 0x03],
            [0x36, 0x49, 0x49, 0x49, 0x36],
            [0x06, 0x49, 0x49, 0x29, 0x1E]
        ]

        if (c >= 48 && c <= 57) {
            return digits[c - 48]
        }

        // Litery A-Z
        const letters: number[][] = [
            [0x7E, 0x11, 0x11, 0x11, 0x7E],
            [0x7F, 0x49, 0x49, 0x49, 0x36],
            [0x3E, 0x41, 0x41, 0x41, 0x22],
            [0x7F, 0x41, 0x41, 0x22, 0x1C],
            [0x7F, 0x49, 0x49, 0x49, 0x41],
            [0x7F, 0x09, 0x09, 0x09, 0x01],
            [0x3E, 0x41, 0x49, 0x49, 0x7A],
            [0x7F, 0x08, 0x08, 0x08, 0x7F],
            [0x00, 0x41, 0x7F, 0x41, 0x00],
            [0x20, 0x40, 0x41, 0x3F, 0x01],
            [0x7F, 0x08, 0x14, 0x22, 0x41],
            [0x7F, 0x40, 0x40, 0x40, 0x40],
            [0x7F, 0x02, 0x0C, 0x02, 0x7F],
            [0x7F, 0x04, 0x08, 0x10, 0x7F],
            [0x3E, 0x41, 0x41, 0x41, 0x3E],
            [0x7F, 0x09, 0x09, 0x09, 0x06],
            [0x3E, 0x41, 0x51, 0x21, 0x5E],
            [0x7F, 0x09, 0x19, 0x29, 0x46],
            [0x46, 0x49, 0x49, 0x49, 0x31],
            [0x01, 0x01, 0x7F, 0x01, 0x01],
            [0x3F, 0x40, 0x40, 0x40, 0x3F],
            [0x1F, 0x20, 0x40, 0x20, 0x1F],
            [0x3F, 0x40, 0x38, 0x40, 0x3F],
            [0x63, 0x14, 0x08, 0x14, 0x63],
            [0x07, 0x08, 0x70, 0x08, 0x07],
            [0x61, 0x51, 0x49, 0x45, 0x43]
        ]

        if (c >= 97 && c <= 122) {
            c -= 32
        }

        if (c >= 65 && c <= 90) {
            return letters[c - 65]
        }

        if (ch == " ") return [0, 0, 0, 0, 0]
        if (ch == ":") return [0, 0x36, 0x36, 0, 0]
        if (ch == ".") return [0, 0x60, 0x60, 0, 0]
        if (ch == "-") return [0x08, 0x08, 0x08, 0x08, 0x08]
        if (ch == "%") return [0x63, 0x13, 0x08, 0x64, 0x63]
        if (ch == "/") return [0x20, 0x10, 0x08, 0x04, 0x02]
        if (ch == "+") return [0x08, 0x08, 0x3E, 0x08, 0x08]

        return [0, 0, 0, 0, 0]
    }

    // ----------------------------------------
    // Rysowanie znaku
    // ----------------------------------------

    function drawChar(
        ch: string,
        x: number,
        y: number
    ): void {

        let data = font(ch)

        for (let col = 0; col < 6; col++) {

            let bits = 0

            if (col < 5) {
                bits = data[col]
            }

            for (let row = 0; row < 8; row++) {

                let on = (bits & (1 << row)) != 0

                setPixel(x + col, y + row, on)
            }
        }
    }

    // ----------------------------------------
    // Tekst z automatycznym nadpisywaniem
    // ----------------------------------------

    /**
     * Wyswietla tekst w kolumnie i wierszu.
     * Automatycznie nadpisuje poprzedni napis.
     */
    //% block="tekst OLED %message kolumna %column wiersz %row"
    //% column.min=0 column.max=20
    //% row.min=0 row.max=7
    //% weight=30
    export function text(
        message: string,
        column: number,
        row: number
    ): void {

        if (row < 0 || row > 7) return
        if (column < 0 || column > 20) return

        let maxLength = 21 - column

        if (message.length > maxLength) {
            message = message.substr(0, maxLength)
        }

        let index = row * 21 + column
        let previousLength = textLengths[index]

        let clearLength = Math.max(previousLength, message.length)

        // Usuniecie poprzedniego tekstu
        for (let i = 0; i < clearLength; i++) {

            let x = (column + i) * 6
            let y = row * 8

            for (let xx = 0; xx < 6; xx++) {
                for (let yy = 0; yy < 8; yy++) {
                    setPixel(x + xx, y + yy, false)
                }
            }
        }

        // Narysowanie nowego tekstu
        for (let i = 0; i < message.length; i++) {

            drawChar(
                message.charAt(i),
                (column + i) * 6,
                row * 8
            )
        }

        textLengths[index] = message.length

        // Odswiezenie tylko zmienionych bajtow
        showChanged()
    }
}