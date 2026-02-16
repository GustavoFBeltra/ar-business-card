/**
 * Touch gesture detection: tap, swipe, long-press.
 * Works on the AR container element.
 */
export class GestureHandler {
  constructor(element) {
    this.element = element;
    this.listeners = {
      tap: [],
      swipe: [],
      longpress: [],
    };

    this._startX = 0;
    this._startY = 0;
    this._startTime = 0;
    this._longPressTimer = null;
    this._longPressFired = false;

    this.SWIPE_THRESHOLD = 50;
    this.LONG_PRESS_DURATION = 500;
    this.TAP_MAX_DISTANCE = 15;

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    element.addEventListener('touchstart', this._onTouchStart, { passive: false });
    element.addEventListener('touchmove', this._onTouchMove, { passive: false });
    element.addEventListener('touchend', this._onTouchEnd, { passive: false });

    // Mouse fallback for desktop testing
    element.addEventListener('mousedown', this._onTouchStart);
    element.addEventListener('mousemove', this._onTouchMove);
    element.addEventListener('mouseup', this._onTouchEnd);
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return this;
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
    return this;
  }

  _emit(event, data) {
    this.listeners[event]?.forEach((cb) => cb(data));
  }

  _getXY(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: touch.clientX, y: touch.clientY };
  }

  _onTouchStart(e) {
    if (e.touches) e.preventDefault(); // Suppress synthesized mouse events on touch devices
    const { x, y } = this._getXY(e);
    this._startX = x;
    this._startY = y;
    this._startTime = Date.now();
    this._longPressFired = false;

    this._longPressTimer = setTimeout(() => {
      this._longPressFired = true;
      this._emit('longpress', { x, y });
    }, this.LONG_PRESS_DURATION);
  }

  _onTouchMove(e) {
    if (this._longPressTimer) {
      const { x, y } = this._getXY(e);
      const dx = x - this._startX;
      const dy = y - this._startY;
      if (Math.sqrt(dx * dx + dy * dy) > this.TAP_MAX_DISTANCE) {
        clearTimeout(this._longPressTimer);
        this._longPressTimer = null;
      }
    }
  }

  _onTouchEnd(e) {
    clearTimeout(this._longPressTimer);
    this._longPressTimer = null;

    if (this._longPressFired) return;

    const { x, y } = this._getXY(e);
    const dx = x - this._startX;
    const dy = y - this._startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - this._startTime;

    if (distance > this.SWIPE_THRESHOLD) {
      // Swipe
      const angle = Math.atan2(dy, dx);
      let direction = 'right';
      if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) direction = 'left';
      else if (angle > Math.PI * 0.25) direction = 'down';
      else if (angle < -Math.PI * 0.25) direction = 'up';

      this._emit('swipe', { direction, dx, dy, x, y });
    } else if (distance < this.TAP_MAX_DISTANCE && elapsed < 300) {
      // Tap
      this._emit('tap', { x, y });
    }
  }

  /**
   * Get normalized device coordinates for raycasting.
   */
  getNDC(x, y) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: ((x - rect.left) / rect.width) * 2 - 1,
      y: -((y - rect.top) / rect.height) * 2 + 1,
    };
  }

  dispose() {
    clearTimeout(this._longPressTimer);
    this.element.removeEventListener('touchstart', this._onTouchStart);
    this.element.removeEventListener('touchmove', this._onTouchMove);
    this.element.removeEventListener('touchend', this._onTouchEnd);
    this.element.removeEventListener('mousedown', this._onTouchStart);
    this.element.removeEventListener('mousemove', this._onTouchMove);
    this.element.removeEventListener('mouseup', this._onTouchEnd);
    this.listeners = { tap: [], swipe: [], longpress: [] };
  }
}
