import { CONTACT, SOCIAL } from './Constants.js';

/**
 * Generates a vCard 3.0 string and triggers download.
 * Includes both work and personal phone/email.
 */
export function downloadVCard() {
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
    `FN:${CONTACT.name}`,
    `ORG:${CONTACT.company}`,
    `TITLE:${CONTACT.title}`,
    `TEL;TYPE=WORK,VOICE:${CONTACT.phoneWork}`,
    `TEL;TYPE=CELL,VOICE:${CONTACT.phonePersonal}`,
    `EMAIL;TYPE=WORK:${CONTACT.emailWork}`,
    `EMAIL;TYPE=HOME:${CONTACT.emailPersonal}`,
    `URL:${CONTACT.website}`,
    SOCIAL.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${SOCIAL.linkedin}` : '',
    SOCIAL.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${SOCIAL.instagram}` : '',
    SOCIAL.x ? `X-SOCIALPROFILE;TYPE=twitter:${SOCIAL.x}` : '',
    SOCIAL.github ? `X-SOCIALPROFILE;TYPE=github:${SOCIAL.github}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${CONTACT.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
