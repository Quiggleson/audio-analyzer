import type { Stft, StftParams } from "./stft";

/** A point in analysis space: seconds and Hz. Never pixels. */
export interface TFPoint {
  t: number;
  f: number;
}

export interface MaskGrid {
  frames: number;
  bins: number;
  params: StftParams;
}

/**
 * Rasterise a closed polygon (seconds x Hz) onto an STFT grid.
 * Returns 1 inside, 0 outside, frame-major like the STFT itself.
 * Even-odd fill, sampled at each frame's centre time and each bin's centre
 * frequency.
 */
export function rasterizePolygon(points: TFPoint[], grid: MaskGrid): Float32Array {
  const { frames, bins, params } = grid;
  const mask = new Float32Array(frames * bins);
  if (points.length < 3) return mask;
  const secPerFrame = params.hop / params.sampleRate;
  const hzPerBin = params.sampleRate / params.fftSize;
  const crossings: number[] = [];

  for (let m = 0; m < frames; m++) {
    const t = m * secPerFrame;
    crossings.length = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      // Half-open rule so a vertex shared by two edges is counted once.
      if (a.t <= t === b.t <= t) continue;
      crossings.push(a.f + ((t - a.t) / (b.t - a.t)) * (b.f - a.f));
    }
    crossings.sort((x, y) => x - y);
    for (let c = 0; c + 1 < crossings.length; c += 2) {
      const k0 = Math.max(0, Math.ceil(crossings[c] / hzPerBin));
      const k1 = Math.min(bins - 1, Math.floor(crossings[c + 1] / hzPerBin));
      for (let k = k0; k <= k1; k++) mask[m * bins + k] = 1;
    }
  }
  return mask;
}

/** Convenience: an axis-aligned box is just a four-point polygon. */
export function rectPolygon(t0: number, t1: number, f0: number, f1: number): TFPoint[] {
  return [
    { t: t0, f: f0 },
    { t: t1, f: f0 },
    { t: t1, f: f1 },
    { t: t0, f: f1 },
  ];
}

/**
 * Soften mask edges with a separable box blur. Hard edges in the mask cause
 * audible ringing; a few bins / frames of feather removes most of it.
 */
export function featherMask(
  mask: Float32Array,
  frames: number,
  bins: number,
  radiusFrames: number,
  radiusBins: number,
): Float32Array {
  let cur = mask;
  if (radiusBins > 0) {
    const next = new Float32Array(mask.length);
    for (let m = 0; m < frames; m++) {
      const off = m * bins;
      let sum = 0;
      for (let k = 0; k <= Math.min(radiusBins, bins - 1); k++) sum += cur[off + k];
      for (let k = 0; k < bins; k++) {
        next[off + k] = sum / (2 * radiusBins + 1);
        const add = k + radiusBins + 1;
        const drop = k - radiusBins;
        if (add < bins) sum += cur[off + add];
        if (drop >= 0) sum -= cur[off + drop];
      }
    }
    cur = next;
  }
  if (radiusFrames > 0) {
    const next = new Float32Array(mask.length);
    for (let k = 0; k < bins; k++) {
      let sum = 0;
      for (let m = 0; m <= Math.min(radiusFrames, frames - 1); m++) sum += cur[m * bins + k];
      for (let m = 0; m < frames; m++) {
        next[m * bins + k] = sum / (2 * radiusFrames + 1);
        const add = m + radiusFrames + 1;
        const drop = m - radiusFrames;
        if (add < frames) sum += cur[add * bins + k];
        if (drop >= 0) sum -= cur[drop * bins + k];
      }
    }
    cur = next;
  }
  return cur;
}

/**
 * Multiply an STFT by a mask, returning a new STFT (the input is untouched).
 * `invert` keeps everything outside the shape instead of inside it.
 */
export function applyMask(s: Stft, mask: Float32Array, invert = false): Stft {
  if (mask.length !== s.re.length) {
    throw new Error(`mask length ${mask.length} does not match STFT ${s.re.length}`);
  }
  const re = new Float32Array(s.re.length);
  const im = new Float32Array(s.im.length);
  for (let i = 0; i < mask.length; i++) {
    const g = invert ? 1 - mask[i] : mask[i];
    re[i] = s.re[i] * g;
    im[i] = s.im[i] * g;
  }
  return { ...s, re, im };
}
