/* =========================================================
 * camera.js – Camera bản đồ: kéo 1 ngón để di chuyển,
 * chụm 2 ngón / lăn chuột để phóng to, có quán tính.
 * ========================================================= */
(function () {
  const Camera = {
    x: 0, y: 0, zoom: 1, minZoom: 0.5, maxZoom: 2, viewW: 1, viewH: 1, W: 1, H: 1, vx: 0, vy: 0,

    setup(W, H, viewW, viewH) {
      this.W = W; this.H = H; this.resize(viewW, viewH);
      this.zoom = this.minZoom * 1.0;
      this.x = W / 2; this.y = H / 2; this.target = null; this.vx = this.vy = 0; this.clamp();
    },
    resize(viewW, viewH) {
      this.viewW = viewW; this.viewH = viewH;
      this.minZoom = Math.min(viewW / this.W, viewH / this.H);
      this.maxZoom = this.minZoom * 2.4;
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
      this.clamp();
    },
    clamp() {
      const hw = this.viewW / 2 / this.zoom, hh = this.viewH / 2 / this.zoom;
      this.x = hw * 2 >= this.W ? this.W / 2 : Math.max(hw, Math.min(this.W - hw, this.x));
      this.y = hh * 2 >= this.H ? this.H / 2 : Math.max(hh, Math.min(this.H - hh, this.y));
    },
    toWorld(sx, sy) { return { x: (sx - this.viewW / 2) / this.zoom + this.x, y: (sy - this.viewH / 2) / this.zoom + this.y }; },
    toScreen(wx, wy) { return { x: (wx - this.x) * this.zoom + this.viewW / 2, y: (wy - this.y) * this.zoom + this.viewH / 2 }; },
    pan(dx, dy) { this.x -= dx / this.zoom; this.y -= dy / this.zoom; this.clamp(); },
    zoomAt(sx, sy, factor) {
      const before = this.toWorld(sx, sy);
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
      const after = this.toWorld(sx, sy);
      this.x += before.x - after.x; this.y += before.y - after.y; this.clamp();
    },
    /** Lướt nhẹ tới một điểm (dùng khi trùm xuất hiện...) */
    focus(wx, wy) { this.target = { x: wx, y: wy }; },
    update(dt) {
      if (this.target) {
        const k = Math.min(1, dt * 4); this.x += (this.target.x - this.x) * k; this.y += (this.target.y - this.y) * k; this.clamp();
        if (Math.hypot(this.target.x - this.x, this.target.y - this.y) < 2) this.target = null;
      }
      if (Math.abs(this.vx) + Math.abs(this.vy) > 1) {
        this.pan(this.vx * dt, this.vy * dt);
        const f = Math.pow(0.04, dt); this.vx *= f; this.vy *= f;
      }
    }
  };
  window.Camera = Camera;
})();
