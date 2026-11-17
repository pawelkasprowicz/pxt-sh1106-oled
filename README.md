# SH1106 OLED 128×64 — MakeCode Extension

MakeCode extension for controlling a **Waveshare 1.3-inch SH1106 OLED display** using **BBC micro:bit V2** via I²C.

The library supports graphics, text rendering, automatic text overwriting, and partial screen updates.

## Features

- SH1106 OLED initialization
- 128×64 monochrome graphics
- I²C communication (default address: `0x3C`)
- Framebuffer (1024 bytes)
- Draw and erase individual pixels
- Draw lines
- Draw rectangles (outlined or filled)
- Draw circles (outlined or filled)
- Display text using a 5×7 font
- Automatic text overwriting at the same position
- Automatic removal of remaining characters when replacing longer text
- Full screen refresh
- Partial screen refresh — transmit only changed bytes

## Hardware Connections

The OLED must be configured for **I²C communication**.

| OLED Pin | micro:bit V2 | Description |
|---|---|---|
| VCC | 3V | Power supply |
| GND | GND | Ground |
| DIN | P20 | I²C SDA |
| CLK | P19 | I²C SCL |
| CS | GND | Chip select |
| D/C | GND | I²C address selection (`0x3C`) |
| RES | 3V | Reset (inactive high) |

**Important:** The Waveshare display may require changing the configuration resistors to enable I²C mode.

The library assumes that the display is already configured for I²C operation.

## Installation

1. Open Microsoft MakeCode for micro:bit.
2. Create or open a project.
3. Select **Extensions**.
4. Search for:

   `github:pawelkasprowicz/pxt-sh1106-oled`

5. Add the extension to your project.

## Available Functions

| Function | Description |
|---|---|
| `sh1106.init()` | Initialize the OLED |
| `sh1106.clear()` | Clear the framebuffer |
| `sh1106.show()` | Refresh the entire display |
| `sh1106.showChanged()` | Refresh only modified bytes |
| `sh1106.pixel(x, y, on)` | Draw or erase a pixel |
| `sh1106.line(x0, y0, x1, y1)` | Draw a line |
| `sh1106.rectangle(x, y, w, h, fill)` | Draw a rectangle |
| `sh1106.circle(cx, cy, r, fill)` | Draw a circle |
| `sh1106.text(message, column, row)` | Display or overwrite text |

## Text Display

The library uses a 5×7 font with one pixel of spacing.

Text positions are specified using character columns and rows.

- Columns: `0–20`
- Rows: `0–7`
- Maximum: 21 characters per row

### Example — Display Text

```typescript
sh1106.init()

sh1106.text("HELLO", 0, 0)
sh1106.text("MICROBIT V2", 0, 2)
```

The `text()` function updates the display immediately.

## Automatic Text Overwriting

Writing