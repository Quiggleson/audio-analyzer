# Task 08: The starter notebook

## Goal

A built-in notebook teaches the owner to read a spectrogram by having them
record short sounds and telling them what to look for. It needs no audio
files: every example is the owner's own voice.

The owner said they know that different parts of a spectrogram carry
different information about speech, and little more. This notebook is where
that intuition starts.

## Read first

- `docs/decisions.md` — 1, 33, 34.
- `docs/design.md` — especially how the reference alternates text, figure and
  a reaction to what was heard.

## Starting point

Everything in tasks 01 to 07: notebook pages, text and spectrogram cells,
record, highlights, lasso, the compare loop, links.

## Build

1. **The notebook is data.** Build it in `src/starter/` as a `ProjectDoc`
   made with the model's own functions. It contains text cells and
   spectrogram cells with empty, named tracks, ready to record into.
2. **When it appears.** On first run, when there are no projects, the start
   screen offers "Start here". A quiet "Add the starter notebook" stays
   available on the start screen afterwards. Each use creates a fresh copy
   with new ids.
3. **The lessons.** One page each, in this order. Each page is: two or three
   sentences, a spectrogram cell with a track to record into, then a few
   sentences on what to look for. Keep sentences short and plain. Where a
   term appears for the first time, say what it means.

   Use only the facts below. They are deliberately rough; say "roughly" and
   "varies from voice to voice" where the numbers appear. Do not add
   phonetics facts from memory. If you think a lesson needs a fact that is
   not here, leave a note for the owner in the pull request instead.

   1. **Hiss.** Record "ssss", then "shhh". Both are noise with no stripes:
      a fricative is air forced through a narrow gap. For "s" most of the
      energy is high, roughly above 4 kHz. For "sh" it starts lower, roughly
      from 2 kHz.
   2. **Stripes.** Set the window to "sharper in pitch". Record a steady
      "aaaa". The evenly spaced horizontal stripes are harmonics. The lowest
      one is the pitch of the voice and the others are multiples of it.
      Record again sliding the pitch upward: the stripes spread apart.
   3. **Bands.** Set the window to "sharper in time". Record "eee", "aaa",
      "ooo". The broad bright bands are formants: frequencies the shape of
      the mouth boosts. The two lowest decide which vowel is heard. Roughly:
      "ee" has one band low (near 300 Hz) and one high (near 2300 Hz); "oo"
      has both low (near 300 and 900 Hz); "ah" has them close together in the
      middle (near 750 and 1200 Hz).
   4. **Voice and shape are separate.** Record "aaa" spoken, then whispered.
      In the whisper the fine stripes vanish, because the vocal folds are not
      vibrating, but the broad bands stay, because the mouth shape is the
      same.
   5. **Bursts.** Record "pa", "ta", "ka". Each starts with a short silence
      while the mouth is closed, then a thin vertical line (the burst of
      released air), then the vowel. These are plosives.
   6. **Hum.** Record "mmmm" and "nnnn". The energy is mostly low, and much
      weaker higher up, because the sound leaves through the nose.
   7. **Pick a sound out.** Record a short sentence with an "s" in it. Drag
      across one word and play it. Then lasso just the hiss of the "s" and
      play that. Name it and link to it from the text.
   8. **Compare.** Add a second track. Record the same word twice, slide one
      until they line up, and play both. Then try it against a clip of
      someone else.

4. **Links inside the starter** use the app's own link syntax, so the
   notebook also demonstrates it.

## Not in this task

- Bundled audio of any kind.
- Automatic checking of what the owner recorded, scores or feedback.
- Any drawing over the spectrogram to point things out. The text says where
  to look.

## Automated checks

- Pure: the starter document passes `parseProject`.
- Pure: every link in the starter resolves, and every lesson page has at
  least one spectrogram cell with an empty named track.
- Pure: two starters created one after the other share no ids.
- Browser: with empty storage, the start screen offers the starter; choosing
  it opens the first lesson; recording from the fake microphone into its
  track works.
- `npm run verify:all` passes.

## Owner checklist

- [ ] With no projects, the start screen offers "Start here".
- [ ] Each lesson tells me what to record and what to look for, in words I
      understand without looking anything up.
- [ ] What I see when I record matches what the lesson says I should see. If
      a lesson does not match, I note which one.
- [ ] The lessons leave the spectrogram itself unmarked.
- [ ] After the last lesson I have used record, the window control,
      highlights, the lasso, a link, and the compare loop at least once.

## Handoff notes

(Filled in by the session that finishes this task.)
