import { CONTACT } from '../utils/Constants.js';
import { downloadVCard } from '../utils/VCardGenerator.js';

/**
 * Contact action handlers: call, email, vCard download, website.
 */
export const ContactActions = {
  call() {
    window.location.href = `tel:${CONTACT.phoneWork}`;
  },

  email() {
    window.location.href = `mailto:${CONTACT.emailWork}?subject=Hello%20from%20AR%20Card`;
  },

  vcard() {
    downloadVCard();
  },

  website() {
    window.open(CONTACT.website, '_blank', 'noopener');
  },
};
