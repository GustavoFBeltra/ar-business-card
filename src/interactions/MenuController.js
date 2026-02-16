/**
 * Menu state machine.
 * States: hidden → entering → idle → item-active → exiting → hidden
 */
export class MenuController {
  constructor() {
    this.state = 'hidden';
    this.activeItemId = null;
    this.listeners = {
      stateChange: [],
      itemSelected: [],
      itemHover: [],
    };
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return this;
  }

  _emit(event, data) {
    this.listeners[event]?.forEach((cb) => cb(data));
  }

  /**
   * Transition to a new state.
   */
  setState(newState) {
    const prev = this.state;
    this.state = newState;
    this._emit('stateChange', { from: prev, to: newState });
  }

  /**
   * Called when AR target is found.
   */
  onTargetFound() {
    if (this.state === 'hidden' || this.state === 'exiting') {
      this.setState('entering');
    }
  }

  /**
   * Called when AR target is lost.
   */
  onTargetLost() {
    if (this.state !== 'hidden') {
      this.setState('exiting');
      // After exit animation, go to hidden
      setTimeout(() => {
        if (this.state === 'exiting') {
          this.setState('hidden');
        }
      }, 600);
    }
  }

  /**
   * Called after entrance animation completes.
   */
  onEntranceComplete() {
    if (this.state === 'entering') {
      this.setState('idle');
    }
  }

  /**
   * Called when user taps a menu item.
   */
  selectItem(id, action) {
    this.activeItemId = id;
    this.setState('item-active');
    this._emit('itemSelected', { id, action });

    // Return to idle after action
    setTimeout(() => {
      if (this.state === 'item-active') {
        this.activeItemId = null;
        this.setState('idle');
      }
    }, 300);
  }

  /**
   * Called when raycaster hovers over an item.
   */
  hoverItem(id) {
    this._emit('itemHover', { id });
  }

  /**
   * Is the menu currently interactive?
   */
  isInteractive() {
    return this.state === 'idle' || this.state === 'item-active';
  }

  /**
   * Is the menu visible (entering, idle, or active)?
   */
  isVisible() {
    return this.state !== 'hidden';
  }
}
