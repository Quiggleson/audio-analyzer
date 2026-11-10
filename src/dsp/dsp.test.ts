import { describe, expect, it } from "vitest";
import { FFT } from "./fft";
import { applyMask, featherMask, rasterizePolygon, rectPolygon } from "./mask";
import { binFrequency, istft, stft, type StftParams } from "./stft";

const SR = 48000;
const PARAMS: StftParams = { fftSize: 2048, hop: 512, sampleRate: SR };

/** Deterministic noise so failures reproduce. */
function noise(length: number, seed = 1): Float32Array {
  const out = new Float32Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = (s / 0xffffffff) * 2 - 1;
  }
  return out;
}

function sine(freq: number, seconds: number, amp = 0.5): Float32Array {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / SR);
  return out;
}

function add(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + b[i];
  return out;
}

function rms(x: Float32Array, from = 0, to = x.length): number {
  let sum = 0;
  for (let i = from; i < to; i++) sum += x[i] * x[i];
  return Math.sqrt(sum / (to - from));
}

/** Amplitude of one frequency in a stretch of signal (single-bin DFT). */
function toneAmplitude(x: Float32Array, freq: number, from: number, to: number): number {
  let re = 0;
  let im = 0;
  for (let i = from; i < to; i++) {
    const a = (2 * Math.PI * freq * i) / SR;
    re += x[i] * Math.cos(a);
    im += x[i] * Math.sin(a);
  }
  return (2 * Math.hypot(re, im)) / (to - from);
}

const db = (ratio: number) => 20 * Math.log10(ratio);

describe("FFT", () => {
  it("matches a naive DFT", () => {
    const n = 64;
    const x = noise(n, 7);
    const re = Float64Array.from(x);
    const im = new Float64Array(n);
    new FFT(n).forward(re, im);
    for (let k = 0; k < n; k++) {
      let er = 0;
      let ei = 0;
      for (let i = 0; i < n; i++) {
        const a = (-2 * Math.PI * k * i) / n;
        er += x[i] * Math.cos(a);
        ei += x[i] * Math.sin(a);
      }
      expect(re[k]).toBeCloseTo(er, 9);
      expect(im[k]).toBeCloseTo(ei, 9);
    }
  });

  it("inverse undoes forward", () => {
    const n = 1024;
    const x = noise(n, 3);
    const re = Float64Array.from(x);
    const im = new Float64Array(n);
    const fft = new FFT(n);
    fft.forward(re, im);
    fft.inverse(re, im);
    for (let i = 0; i < n; i++) expect(re[i]).toBeCloseTo(x[i], 10);
  });

  it("rejects sizes that are not powers of two", () => {
    expect(() => new FFT(1000)).toThrow();
  });
});

describe("STFT round trip", () => {
  it("reconstructs noise, including the first and last samples", () => {
    // Deliberately not a multiple of the hop.
    const x = noise(SR + 137);
    const y = istft(stft(x, PARAMS));
    expect(y.length).toBe(x.length);
    let worst = 0;
    for (let i = 0; i < x.length; i++) worst = Math.max(worst, Math.abs(x[i] - y[i]));
    expect(worst).toBeLessThan(1e-5);
  });

  it("puts a 1 kHz tone in the 1 kHz bin", () => {
    const s = stft(sine(1000, 0.5), PARAMS);
    const m = Math.floor(s.frames / 2);
    let best = 0;
    for (let k = 1; k < s.bins; k++) {
      const mag = Math.hypot(s.re[m * s.bins + k], s.im[m * s.bins + k]);
      if (mag > Math.hypot(s.re[m * s.bins + best], s.im[m * s.bins + best])) best = k;
    }
    expect(Math.abs(binFrequency(best, PARAMS) - 1000)).toBeLessThan(SR / PARAMS.fftSize);
  });
});

describe("lasso (mask and resynthesise)", () => {
  const low = sine(500, 1);
  const high = sine(3000, 1);
  const mix = add(low, high);
  const s = stft(mix, PARAMS);
  const grid = { frames: s.frames, bins: s.bins, params: PARAMS };
  const mid: [number, number] = [0.25 * SR, 0.75 * SR];

  it("keeps the circled frequency band and removes the rest", () => {
    const mask = rasterizePolygon(rectPolygon(-1, 2, 2500, 3500), grid);
    const y = istft(applyMask(s, mask));
    expect(db(toneAmplitude(y, 3000, ...mid) / 0.5)).toBeGreaterThan(-0.5);
    expect(db(toneAmplitude(y, 500, ...mid) / 0.5)).toBeLessThan(-60);
  });

  it("invert keeps everything except the shape", () => {
    const mask = rasterizePolygon(rectPolygon(-1, 2, 2500, 3500), grid);
    const y = istft(applyMask(s, mask, true));
    expect(db(toneAmplitude(y, 500, ...mid) / 0.5)).toBeGreaterThan(-0.5);
    expect(db(toneAmplitude(y, 3000, ...mid) / 0.5)).toBeLessThan(-60);
  });

  it("is local in time", () => {
    const mask = rasterizePolygon(rectPolygon(0.4, 0.6, 0, SR / 2), grid);
    const y = istft(applyMask(s, mask));
    const inside = rms(y, 0.45 * SR, 0.55 * SR);
    expect(inside).toBeGreaterThan(0.9 * rms(mix, 0.45 * SR, 0.55 * SR));
    expect(db(rms(y, 0, 0.3 * SR) / inside)).toBeLessThan(-60);
    expect(db(rms(y, 0.7 * SR, SR) / inside)).toBeLessThan(-60);
  });

  it("handles a non-rectangular polygon", () => {
    // Triangle: wide in frequency at t=0.2, a point at t=0.8.
    const tri = [
      { t: 0.2, f: 2000 },
      { t: 0.2, f: 4000 },
      { t: 0.8, f: 3000 },
    ];
    const mask = rasterizePolygon(tri, grid);
    const at = (t: number, f: number) =>
      mask[Math.round((t * SR) / PARAMS.hop) * s.bins + Math.round((f * PARAMS.fftSize) / SR)];
    expect(at(0.3, 3000)).toBe(1);
    expect(at(0.3, 500)).toBe(0);
    expect(at(0.7, 3700)).toBe(0);
    expect(at(0.9, 3000)).toBe(0);
  });

  it("feathering keeps values in range and softens edges", () => {
    const hard = rasterizePolygon(rectPolygon(0.4, 0.6, 2500, 3500), grid);
    const soft = featherMask(hard, s.frames, s.bins, 2, 3);
    let partial = 0;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < soft.length; i++) {
      min = Math.min(min, soft[i]);
      max = Math.max(max, soft[i]);
      if (soft[i] > 0.01 && soft[i] < 0.99) partial++;
    }
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(1 + 1e-6);
    expect(partial).toBeGreaterThan(0);
  });

  it("does not modify the source STFT", () => {
    const before = s.re.slice();
    applyMask(s, rasterizePolygon(rectPolygon(0, 1, 0, 100), grid));
    expect(s.re).toEqual(before);
  });
});

describe("performance budget", () => {
  it("analyses and resynthesises a 60 s clip fast enough to feel instant", () => {
    const x = noise(60 * SR);
    const t0 = performance.now();
    const s = stft(x, PARAMS);
    const t1 = performance.now();
    const mask = rasterizePolygon(rectPolygon(10, 20, 1000, 4000), {
      frames: s.frames,
      bins: s.bins,
      params: PARAMS,
    });
    const y = istft(applyMask(s, mask));
    const t2 = performance.now();
    console.log(
      `60 s @ 48 kHz: stft ${(t1 - t0).toFixed(0)} ms, mask+istft ${(t2 - t1).toFixed(0)} ms, ` +
        `${s.frames} frames x ${s.bins} bins, ${((s.re.byteLength * 2) / 1e6).toFixed(0)} MB`,
    );
    expect(y.length).toBe(x.length);
    // Generous ceiling; CI machines vary. The real target is well under this.
    expect(t2 - t0).toBeLessThan(5000);
  });
});
