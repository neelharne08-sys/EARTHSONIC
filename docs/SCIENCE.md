# Scientific basis and limitations

## Intended NASA EIC visualization

- NASA Scientific Visualization Studio, ID 5313: https://svs.gsfc.nasa.gov/5313/
- Title: Change in Night Lights between 2012 and 2023 — EIC Version
- Data context: NASA/NOAA VIIRS and the NASA Black Marble night-light observation program
- The source describes annual-average changes in nighttime lighting from 2012 to 2023 and displays zoom-ins including India.

## Initial sonification mapping

1. Take a valid raster image frame from EIC visualization.
2. Resize to 100 columns and 70 rows.
3. Convert each pixel's color to *relative displayed luminance* using linear weights 0.2126 R + 0.7152 G + 0.0722 B, after converting byte values to 0–1. This is an approximate feature metric computed from displayed pixel values; it is not a fully color-managed luminance conversion.
4. Average the pixel feature across the 70 rows of each vertical image slice.
5. Normalize the sequence between the minimum and maximum values of that same frame.
6. Map normalized value v to frequency f = 180 + 580v Hz.
7. Play a live-generated sine tone as a cursor traverses the image.

## What the method cannot claim

- It does **not** measure or infer exact city brightness, lighting intensity, energy demand, or environmental conditions.
- An annotation, legend, or blank background affects the pixel analysis; use spatial masking or actual data layers in a later version.
- Changing contrast in the source image changes the generated tones.
- The built-in SVG is purely synthetic and must never be described as NASA imagery.

## Next genuine research task — Shubhanshu

Check with the NASA challenge Resources tab whether a more relevant EIC frame or frame sequence is recommended. Identify a 2–3 frame sequence or matching actual data values to demonstrate time-based change. Document exact source URLs, dates, units and interpretive limitations. Coordinate findings with the engineering team.
