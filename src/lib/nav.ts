export interface NavItem {
  readonly id: string;
  readonly label: string;
}

/** Section order on the page; the sidebar and mobile drawer both render from this. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'research', label: 'Research' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'feedback', label: 'Feedback' },
];
