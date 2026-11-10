# Design

## The reference

The owner named this page as the look and feel to aim for:
https://speechprocessingbook.aalto.fi/enhancement/noise-attenuation/

It is an online textbook chapter (built with MyST). What it looks like, as
seen on 2026-11-10 at 1440 px wide:

- **Three columns under a thin top bar.** Left: the book's chapters as a
  collapsible tree, current page highlighted with a pale blue pill. Centre:
  the reading column, about 720 px wide. Right: a "Contents" outline of the
  current page's headings, with the current section highlighted.
- **Top bar:** a small logo on the left, a search box and a light/dark toggle
  on the right. Nothing else.
- **White background, near-black text, one blue accent** used for links and
  for the current item in both sidebars. System sans-serif font. Body text is
  large with generous line spacing; headings are bold and not much bigger.
- **The page reads top to bottom as an argument.** A typical stretch is:
  a few paragraphs, then a figure, then an audio player directly under the
  figure, then a paragraph reacting to what was just heard ("This is quite
  awful, isn't it?"), then the next figure.
- **Figures are the full width of the reading column.** A typical one stacks a
  line plot over a spectrogram with a shared time axis, labelled axes (time
  in seconds, frequency in kHz) and a purple-to-yellow colour map.
- **The audio player is small and plain**, left-aligned under its figure.
- **Supporting material is collapsed** behind a toggle so it does not
  interrupt reading.

## What to take from it

- The notebook page is the main screen. It should read like that chapter:
  prose, then a spectrogram you can play, then prose about it.
- Keep the three-column shape: pages on the left, the notebook in the centre,
  the current page's outline on the right.
- One accent colour. No toolbars full of icons. Controls for a spectrogram
  cell belong to that cell and stay out of the way when it is not in use.
- A spectrogram cell in this app does more than the reference's static image:
  it pans, zooms, plays, and (for the owner) records and edits. It should
  still sit in the page like a figure, not like an embedded application.
- Light and dark themes, with a toggle.

## What not to copy

Do not copy the book's text, images, logo or code. Only the layout ideas
above are the reference.
