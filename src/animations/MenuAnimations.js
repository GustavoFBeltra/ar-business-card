import gsap from 'gsap';
import { TIMING } from '../utils/Constants.js';

/**
 * Menu entrance stagger, hover pulse, typing labels, connection line animations.
 */
export class MenuAnimations {
  constructor(menuSystem) {
    this.menu = menuSystem;
    this.typingTimelines = [];
  }

  /**
   * Stagger-in animation for all menu items.
   */
  entrance(onComplete) {
    const items = this.menu.getItems();
    const tl = gsap.timeline({ onComplete });

    items.forEach((item, i) => {
      const obj = item.getObject();
      obj.visible = true;
      obj.scale.setScalar(0);

      tl.to(
        obj.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: TIMING.menuItemEntrance,
          ease: 'back.out(2.5)',
        },
        i * TIMING.menuStaggerDelay
      );
    });

    // Connection lines fade in after items
    tl.call(() => {
      this.menu.setConnectionLinesVisible(true);
    }, null, items.length * TIMING.menuStaggerDelay + 0.2);

    // Start typing animation after items are visible
    tl.call(() => {
      this._startTypingAnimation();
    }, null, items.length * TIMING.menuStaggerDelay + 0.1);

    return tl;
  }

  /**
   * Typing animation for menu labels.
   */
  _startTypingAnimation() {
    const items = this.menu.getItems();

    items.forEach((item, i) => {
      const label = item.config.label;
      const obj = { charCount: 0 };

      const tl = gsap.to(obj, {
        charCount: label.length,
        duration: label.length * TIMING.typingSpeed,
        delay: i * 0.12,
        ease: 'none',
        onUpdate: () => {
          item.setTypingProgress(Math.floor(obj.charCount));
        },
      });

      this.typingTimelines.push(tl);
    });
  }

  /**
   * Hover pulse effect on a menu item.
   */
  hoverPulse(itemId) {
    const item = this.menu.getItem(itemId);
    if (!item) return;

    const obj = item.getObject();
    gsap.to(obj.scale, {
      x: 1.08,
      y: 1.08,
      z: 1.08,
      duration: TIMING.hoverPulse,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  }

  /**
   * Tap feedback - quick scale bump.
   */
  tapFeedback(itemId) {
    const item = this.menu.getItem(itemId);
    if (!item) return;

    const obj = item.getObject();
    gsap.timeline()
      .to(obj.scale, {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration: 0.08,
        ease: 'power2.in',
      })
      .to(obj.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.15,
        ease: 'elastic.out(1, 0.5)',
      })
      .to(obj.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
  }

  /**
   * Exit animation - stagger out.
   */
  exit() {
    const items = this.menu.getItems();
    this.menu.setConnectionLinesVisible(false);

    const tl = gsap.timeline();

    items.forEach((item, i) => {
      tl.to(
        item.getObject().scale,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.25,
          ease: 'back.in(2)',
        },
        i * 0.03
      );
    });

    return tl;
  }

  dispose() {
    this.typingTimelines.forEach((tl) => tl.kill());
    this.typingTimelines = [];
  }
}
