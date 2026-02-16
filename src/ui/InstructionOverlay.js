/**
 * "Point camera at card" instruction hint.
 * Shows after camera is ready, hides when target is found.
 */
export class InstructionOverlay {
  constructor() {
    this.element = document.getElementById('instruction-overlay');
    this.visible = false;
  }

  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.visible = true;
    }
  }

  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
      this.visible = false;
    }
  }

  toggle(show) {
    if (show) this.show();
    else this.hide();
  }
}
