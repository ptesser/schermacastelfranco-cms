export interface NavItem {
  label: string;
  href: string;
}

/** Main navigation, in display order. "Contatti" is rendered as a call to action. */
export const mainNav: NavItem[] = [
  { label: 'Il circolo', href: '/il-circolo/' },
  { label: 'Corsi', href: '/corsi/' },
  { label: 'Notizie e gare', href: '/notizie/' },
  { label: 'Galleria', href: '/galleria/' },
  { label: 'Documenti', href: '/documenti/' },
];

export const contactNav: NavItem = { label: 'Contatti', href: '/contatti/' };

export const legalNav: NavItem[] = [
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Cookie', href: '/cookie/' },
  { label: 'Dichiarazione di accessibilità', href: '/accessibilita/' },
];

/** True when `href` is the current page or one of its parents. */
export function isCurrent(href: string, pathname: string): boolean {
  const normalise = (path: string) => (path.endsWith('/') ? path : `${path}/`);
  return normalise(pathname).startsWith(normalise(href));
}
