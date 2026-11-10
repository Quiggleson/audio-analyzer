/**
 * In-place iterative radix-2 complex FFT.
 *
 * Pure numeric code: no DOM, no Web Audio. Everything in src/dsp must stay
 * runnable in plain Node so it can be unit-tested without a browser.
 */
export class FFT {
  readonly size: number;
  private readonly cos: Float64Array;
  private readonly sin: Float64Array;
  private readonly rev: Uint32Array;

  constructor(size: number) {
    if (size < 2 || (size & (size - 1)) !== 0) {
      throw new Error(`FFT size must be a power of two >= 2, got ${size}`);
    }
    this.size = size;
    const half = size >> 1;
    this.cos = new Float64Array(half);
    this.sin = new Float64Array(half);
    for (let i = 0; i < half; i++) {
      const a = (-2 * Math.PI * i) / size;
      this.cos[i] = Math.cos(a);
      this.sin[i] = Math.sin(a);
    }
    const bits = Math.log2(size);
    this.rev = new Uint32Array(size);
    for (let i = 0; i < size; i++) {
      let r = 0;
      for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b);
      this.rev[i] = r;
    }
  }

  /** Forward transform, in place. No scaling. */
  forward(re: Float64Array, im: Float64Array): void {
    this.transform(re, im, false);
  }

  /** Inverse transform, in place. Scaled by 1/size so inverse(forward(x)) = x. */
  inverse(re: Float64Array, im: Float64Array): void {
    this.transform(re, im, true);
    const n = this.size;
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }

  private transform(re: Float64Array, im: Float64Array, inverse: boolean): void {
    const n = this.size;
    if (re.length !== n || im.length !== n) {
      throw new Error(`FFT buffers must have length ${n}`);
    }
    const { rev, cos, sin } = this;
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) {
        const tr = re[i];
        re[i] = re[j];
        re[j] = tr;
        const ti = im[i];
        im[i] = im[j];
        im[j] = ti;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1;
      const step = n / len;
      for (let start = 0; start < n; start += len) {
        for (let k = 0; k < half; k++) {
          const wr = cos[k * step];
          const wi = inverse ? -sin[k * step] : sin[k * step];
          const a = start + k;
          const b = a + half;
          const xr = re[b] * wr - im[b] * wi;
          const xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr;
          im[b] = im[a] - xi;
          re[a] += xr;
          im[a] += xi;
        }
      }
    }
  }
}
