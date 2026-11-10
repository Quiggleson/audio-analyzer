import { FFT } from "./fft";

/**
 * Short-time Fourier transform that can be inverted back to audio.
 *
 * Layout: frame-major. Value for frame `m`, bin `k` lives at `m * bins + k`.
 * Frame `m` is centred on sample `m * hop` (the signal is zero-padded by
 * fftSize/2 on both sides), so frame time in seconds is `m * hop / sampleRate`
 * and bin frequency in Hz is `k * sampleRate / fftSize`.
 */
export interface StftParams {
  /** Window and FFT length in samples. Power of two. */
  fftSize: number;
  /** Samples between successive frames. Must be <= fftSize / 2. */
  hop: number;
  sampleRate: number;
}

export interface Stft {
  params: StftParams;
  /** Length of the original signal in samples, needed to invert exactly. */
  length: number;
  frames: number;
  /** fftSize / 2 + 1 */
  bins: number;
  re: Float32Array;
  im: Float32Array;
}

/** Periodic Hann window. Used for both analysis and synthesis. */
export function hann(size: number): Float64Array {
  const w = new Float64Array(size);
  for (let i = 0; i < size; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size);
  return w;
}

function checkParams({ fftSize, hop }: StftParams): void {
  if (!Number.isInteger(hop) || hop < 1 || hop > fftSize / 2) {
    throw new Error(`hop must be an integer in [1, fftSize/2], got ${hop}`);
  }
}

export function frameCount(length: number, hop: number): number {
  return Math.floor(length / hop) + 1;
}

export function frameTime(frame: number, p: StftParams): number {
  return (frame * p.hop) / p.sampleRate;
}

export function binFrequency(bin: number, p: StftParams): number {
  return (bin * p.sampleRate) / p.fftSize;
}

export function stft(signal: Float32Array, params: StftParams): Stft {
  checkParams(params);
  const { fftSize, hop } = params;
  const fft = new FFT(fftSize);
  const window = hann(fftSize);
  const bins = fftSize / 2 + 1;
  const frames = frameCount(signal.length, hop);
  const re = new Float32Array(frames * bins);
  const im = new Float32Array(frames * bins);
  const bufRe = new Float64Array(fftSize);
  const bufIm = new Float64Array(fftSize);
  const pad = fftSize / 2;

  for (let m = 0; m < frames; m++) {
    const start = m * hop - pad;
    for (let i = 0; i < fftSize; i++) {
      const n = start + i;
      bufRe[i] = n >= 0 && n < signal.length ? signal[n] * window[i] : 0;
      bufIm[i] = 0;
    }
    fft.forward(bufRe, bufIm);
    const off = m * bins;
    for (let k = 0; k < bins; k++) {
      re[off + k] = bufRe[k];
      im[off + k] = bufIm[k];
    }
  }
  return { params, length: signal.length, frames, bins, re, im };
}

/**
 * Inverse STFT by weighted overlap-add (least-squares / Griffin-Lim form):
 * each frame is windowed again on synthesis and the sum is divided by the
 * overlapped squared window. This gives exact reconstruction for an
 * unmodified STFT and the least-squares-best signal for a masked one.
 */
export function istft(s: Stft): Float32Array {
  checkParams(s.params);
  const { fftSize, hop } = s.params;
  const fft = new FFT(fftSize);
  const window = hann(fftSize);
  const pad = fftSize / 2;
  const paddedLength = s.length + fftSize;
  const acc = new Float64Array(paddedLength);
  const norm = new Float64Array(paddedLength);
  const bufRe = new Float64Array(fftSize);
  const bufIm = new Float64Array(fftSize);

  for (let m = 0; m < s.frames; m++) {
    const off = m * s.bins;
    for (let k = 0; k < s.bins; k++) {
      bufRe[k] = s.re[off + k];
      bufIm[k] = s.im[off + k];
    }
    // Rebuild the negative-frequency half from conjugate symmetry.
    for (let k = 1; k < s.bins - 1; k++) {
      bufRe[fftSize - k] = bufRe[k];
      bufIm[fftSize - k] = -bufIm[k];
    }
    fft.inverse(bufRe, bufIm);
    const start = m * hop;
    for (let i = 0; i < fftSize; i++) {
      const n = start + i;
      if (n >= paddedLength) break;
      acc[n] += bufRe[i] * window[i];
      norm[n] += window[i] * window[i];
    }
  }

  const out = new Float32Array(s.length);
  for (let n = 0; n < s.length; n++) {
    const d = norm[n + pad];
    out[n] = d > 1e-9 ? acc[n + pad] / d : 0;
  }
  return out;
}

/** Magnitude in dB (20*log10), floored at `floorDb`. Same layout as the STFT. */
export function magnitudeDb(s: Stft, floorDb = -120): Float32Array {
  const out = new Float32Array(s.re.length);
  const floor = Math.pow(10, floorDb / 20);
  for (let i = 0; i < out.length; i++) {
    const mag = Math.hypot(s.re[i], s.im[i]);
    out[i] = 20 * Math.log10(Math.max(mag, floor));
  }
  return out;
}
