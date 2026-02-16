/**
 * Loading overlay with progress bar.
 */
export class LoadingScreen {
  constructor() {
    this.element = document.getElementById('loading-screen');
    this.progressBar = this.element?.querySelector('.loader-progress-bar');
    this.textElement = this.element?.querySelector('.loader-text');
  }

  /**
   * Update loading progress (0-100).
   */
  setProgress(percent) {
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(100, percent)}%`;
    }
  }

  /**
   * Update loading status text.
   */
  setText(text) {
    if (this.textElement) {
      this.textElement.textContent = text;
    }
  }

  /**
   * Fade out and remove the loading screen.
   */
  hide() {
    if (this.element) {
      this.element.classList.add('fade-out');
      setTimeout(() => {
        this.element.style.display = 'none';
      }, 600);
    }
  }

  /**
   * Show the loading screen.
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.element.classList.remove('fade-out');
    }
  }
}
