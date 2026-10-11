/** Scroll-linked original film. No video player, autoplay, or scroll interception.
 * Decode only a small window of frames to bound mobile memory usage. */
export class ScrollFilm {
  constructor(canvas, { count, onError }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.count = count;
    this.onError = onError;
    this.target = 0;
    this.drawn = -1;
    this.cache = new Map();
    this.pending = new Set();
    this.failed = new Set();
    this.queue = [];
    this.active = 0;
    this.enabled = true;
    this.mobile = matchMedia('(max-width: 760px)').matches;
    this.folder = this.mobile ? 'frames-mobile' : 'frames';
    this.resizeObserver = new ResizeObserver(() => { this.resize(); this.paint(true); });
    this.resizeObserver.observe(canvas);
    this.resize();
    this.seek(0);
  }
  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    // The source is 720p; higher backing resolution gives no extra image detail.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
  }
  seek(progress) {
    if (!this.enabled) return;
    this.target = Math.max(0, Math.min(this.count - 1, Math.round(progress * (this.count - 1))));
    const wanted = [this.target];
    for (let d = 1; d <= 6; d++) wanted.push(this.target + d, this.target - d);
    this.queue = wanted.filter(i => i >= 0 && i < this.count && !this.cache.has(i) && !this.pending.has(i) && !this.failed.has(i));
    this.paint();
    this.pump();
  }
  pump() {
    while (this.enabled && this.active < 4 && this.queue.length) {
      const frame = this.queue.shift();
      this.active++;
      this.pending.add(frame);
      this.load(frame).finally(() => { this.active--; this.pending.delete(frame); this.pump(); });
    }
  }
  async load(frame) {
    try {
      const response = await fetch(`/media/${this.folder}/${String(frame).padStart(3, '0')}.webp`, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Frame ${frame}: ${response.status}`);
      const blob = await response.blob();
      let bitmap;
      if ('createImageBitmap' in window) bitmap = await createImageBitmap(blob);
      else {
        const url = URL.createObjectURL(blob);
        try { bitmap = new Image(); bitmap.src = url; await bitmap.decode(); }
        finally { URL.revokeObjectURL(url); }
      }
      this.cache.set(frame, bitmap);
      while (this.cache.size > 28) {
        const farthest = [...this.cache.keys()].sort((a,b) => Math.abs(b - this.target) - Math.abs(a - this.target))[0];
        this.cache.get(farthest).close?.();
        this.cache.delete(farthest);
      }
      this.paint();
    } catch (error) {
      this.failed.add(frame);
      if (this.failed.size > 3 && !this.cache.size) this.onError(error);
    }
  }
  paint(force = false) {
    if (!this.enabled || !this.cache.size) return;
    // Keep the nearest available frame visible during a rapid fling or network delay.
    const nearest = this.cache.has(this.target) ? this.target : [...this.cache.keys()].reduce((a,b) => Math.abs(a-this.target) < Math.abs(b-this.target) ? a : b);
    if (!force && nearest === this.drawn) return;
    const img = this.cache.get(nearest);
    const w = this.canvas.width, h = this.canvas.height;
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    const focus = matchMedia('(max-width:760px)').matches ? .56 : .58;
    this.ctx.drawImage(img, (w-dw)*focus, (h-dh)/2, dw, dh);
    this.drawn = nearest;
    this.canvas.dataset.frame = String(nearest);
    this.canvas.style.opacity = '1';
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    this.canvas.style.opacity = enabled && this.cache.size ? '1' : '0';
    if (!enabled) {
      this.queue = [];
      for (const bitmap of this.cache.values()) bitmap.close?.();
      this.cache.clear(); this.drawn = -1;
    } else this.seek(0);
  }
}
