/**
 * Camera permission UX.
 * Shows a friendly prompt before triggering the browser's permission dialog.
 */
export class PermissionPrompt {
  constructor() {
    this.element = document.getElementById('permission-prompt');
    this.button = document.getElementById('permission-btn');
    this._resolve = null;
  }

  /**
   * Show the permission prompt and wait for user to click.
   * @returns {Promise<boolean>} - true if permission granted, false if denied
   */
  async request() {
    // Check if camera is already available
    const existingPermission = await this._checkExisting();
    if (existingPermission === 'granted') return true;

    // Show our custom prompt
    return new Promise((resolve) => {
      this._resolve = resolve;
      this.element?.classList.remove('hidden');

      this.button?.addEventListener('click', async () => {
        this.element?.classList.add('hidden');

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          // Stop the test stream - MindAR will request its own
          stream.getTracks().forEach((t) => t.stop());
          resolve(true);
        } catch {
          resolve(false);
        }
      }, { once: true });
    });
  }

  async _checkExisting() {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state;
    } catch {
      return 'prompt';
    }
  }

  hide() {
    this.element?.classList.add('hidden');
  }
}
