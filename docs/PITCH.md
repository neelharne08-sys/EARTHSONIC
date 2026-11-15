# Presentation and test plan — member 4

## 60-second pitch draft

Earth information is usually presented visually, leaving opportunities for more inclusive, multisensory communication. Team Vertex built EarthPulse for NASA Space Apps 2026 PS 14. We take an authentic frame from NASA's Earth Information Center, analyze visual brightness patterns, and map them to sound in real time. Visitors can hear the changing visual pattern as a scan moves across the frame. The first version represents displayed image features, not calibrated physical measurements. Our future goal is to incorporate time-varying EIC imagery and matching scientific data so visitors can compare Earth observations across time by both sight and sound.

## Demo sequence

1. Show the PS 14 title and official NASA EIC source link.
2. Click Load NASA EIC frame. Confirm the NASA source label appears.
3. Play the live sonification with headphones or speakers enabled.
4. Scrub the scan position and show both the frequency and image brightness changing.
5. Explain the formula, source, accessibility motivation and limitations.
6. Show team contributions and GitHub history, then Q&A.

## Testing checklist

- [ ] Built-in example states clearly that it is not NASA data.
- [ ] NASA EIC source image loads from local assets path.
- [ ] Plot changes based on different visual frames.
- [ ] Audio is audible only after user interaction.
- [ ] Stop button ends audio promptly.
- [ ] Scrubber moves the visual line and updates frequency.
- [ ] All buttons are keyboard accessible.
- [ ] Mobile layout is usable.
- [ ] Real NASA image is credited, with source page in README.
- [ ] README names all four human members and their roles.
- [ ] AI disclosure accurately identifies assisted files.
- [ ] Source, demo and GitHub repository links work.

## Future improvements

- Screen-reader-friendly spoken descriptions, and captions of the sound parameters.
- Multiple EIC frames and a time slider to compare observations.
- Actual measurements linked to the chosen EIC frame, with units and reference documentation.
- Side-by-side original image and masked scientific-data view.
