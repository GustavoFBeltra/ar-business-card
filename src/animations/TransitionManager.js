import { CardAnimations } from './CardAnimations.js';
import { MenuAnimations } from './MenuAnimations.js';

/**
 * Orchestrates all animation sequences.
 * Single entry point for target found/lost, menu interactions, etc.
 */
export class TransitionManager {
  constructor(cardModel, logoModel, menuSystem, menuController) {
    this.cardAnims = new CardAnimations(cardModel, logoModel);
    this.menuAnims = new MenuAnimations(menuSystem);
    this.menuController = menuController;
    this.cardModel = cardModel;
    this.isEntrancePlaying = false;
  }

  /**
   * Called when MindAR finds the target image.
   */
  onTargetFound() {
    if (this.isEntrancePlaying) return;
    this.isEntrancePlaying = true;

    this.menuController.onTargetFound();

    // Play card entrance, then menu entrance
    this.cardAnims.entrance(() => {
      this.menuAnims.entrance(() => {
        this.menuController.onEntranceComplete();
        this.cardAnims.startIdle();
        this.isEntrancePlaying = false;
      });
    });
  }

  /**
   * Called when MindAR loses the target image.
   */
  onTargetLost() {
    this.menuController.onTargetLost();

    // Parallel exit animations
    this.menuAnims.exit();
    this.cardAnims.exit();
    this.isEntrancePlaying = false;
  }

  /**
   * Called when a menu item is tapped.
   */
  onMenuItemTap(itemId) {
    this.menuAnims.tapFeedback(itemId);
  }

  /**
   * Called when a menu item is hovered.
   */
  onMenuItemHover(itemId) {
    this.menuAnims.hoverPulse(itemId);
  }

  /**
   * Trigger card flip (long-press).
   */
  flipCard() {
    return this.cardAnims.flip();
  }

  /**
   * Set the holographic edge glow.
   */
  setEdgeGlow(opacity) {
    this.cardModel.setGlowOpacity(opacity);
  }

  dispose() {
    this.cardAnims.dispose();
    this.menuAnims.dispose();
  }
}
