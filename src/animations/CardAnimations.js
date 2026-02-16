import gsap from 'gsap';
import { TIMING } from '../utils/Constants.js';

/**
 * Card entrance, idle float, and flip animations using GSAP.
 */
export class CardAnimations {
  constructor(cardModel, logoModel) {
    this.card = cardModel;
    this.logo = logoModel;
    this.idleTimeline = null;
    this.isFlipped = false;
  }

  /**
   * Elastic scale-in entrance + logo drop-in with spin.
   */
  entrance(onComplete) {
    const cardObj = this.card.getObject();
    const logoObj = this.logo.getObject();

    // Start state
    cardObj.scale.setScalar(0);
    logoObj.scale.setScalar(0);
    logoObj.position.y = 0.25;

    const tl = gsap.timeline({ onComplete });

    // Card scales in with elastic easing
    tl.to(cardObj.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: TIMING.cardEntrance,
      ease: 'elastic.out(1, 0.5)',
    });

    // Edge glow sweeps on
    const cardRef = this.card;
    tl.to(
      {},
      {
        duration: 0.6,
        onUpdate: function () {
          cardRef.setGlowOpacity(this.progress() * 0.6);
        },
        onUpdateParams: [],
      },
      '-=0.6'
    );

    // Logo drops in with spin
    tl.to(
      logoObj.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: TIMING.logoDropIn,
        ease: 'back.out(2)',
      },
      '-=0.4'
    );

    tl.to(
      logoObj.position,
      {
        y: 0.06,
        duration: TIMING.logoDropIn,
        ease: 'power2.out',
      },
      '<'
    );

    tl.to(
      logoObj.rotation,
      {
        y: Math.PI * 2,
        duration: TIMING.logoDropIn * 1.2,
        ease: 'power2.out',
      },
      '<'
    );

    return tl;
  }

  /**
   * Subtle idle floating animation (loops).
   */
  startIdle() {
    const cardObj = this.card.getObject();
    const logoObj = this.logo.getObject();

    this.idleTimeline = gsap.timeline({ repeat: -1, yoyo: true });

    // Card subtle float
    this.idleTimeline.to(cardObj.position, {
      y: '+=0.008',
      duration: 2,
      ease: 'sine.inOut',
    });

    // Logo gentle spin
    gsap.to(logoObj.rotation, {
      y: '+=6.283', // 2*PI
      duration: 12,
      ease: 'none',
      repeat: -1,
    });
  }

  /**
   * Stop idle animation.
   */
  stopIdle() {
    if (this.idleTimeline) {
      this.idleTimeline.kill();
      this.idleTimeline = null;
    }
    gsap.killTweensOf(this.logo.getObject().rotation);
  }

  /**
   * Flip the card 180 degrees.
   */
  flip() {
    const cardObj = this.card.getObject();
    this.isFlipped = !this.isFlipped;
    const targetY = this.isFlipped ? Math.PI : 0;

    return gsap.to(cardObj.rotation, {
      y: targetY,
      duration: TIMING.cardFlip,
      ease: 'power2.inOut',
    });
  }

  /**
   * Exit animation - scale down and fade.
   */
  exit() {
    this.stopIdle();
    const cardObj = this.card.getObject();
    const logoObj = this.logo.getObject();

    return gsap.timeline()
      .to(logoObj.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.3,
        ease: 'back.in(2)',
      })
      .to(cardObj.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.4,
        ease: 'back.in(2)',
      }, '-=0.15');
  }

  dispose() {
    this.stopIdle();
  }
}
