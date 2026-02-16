import { SOCIAL } from '../utils/Constants.js';

/**
 * Social link handlers. Each opens the respective profile.
 */
export const SocialActions = {
  linkedin() {
    window.open(SOCIAL.linkedin, '_blank', 'noopener');
  },

  instagram() {
    window.open(SOCIAL.instagram, '_blank', 'noopener');
  },

  x() {
    window.open(SOCIAL.x, '_blank', 'noopener');
  },

  github() {
    window.open(SOCIAL.github, '_blank', 'noopener');
  },

  youtube() {
    window.open(SOCIAL.youtube, '_blank', 'noopener');
  },

  tiktok() {
    window.open(SOCIAL.tiktok, '_blank', 'noopener');
  },
};
