/** Accessible horizontal tabs (WAI-ARIA): roving tabindex, Left/Right/Home/End. Used by Experience and Projects. */

function targetIndex(key: string, index: number, last: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return index === last ? 0 : index + 1;
    case 'ArrowLeft':
      return index === 0 ? last : index - 1;
    case 'Home':
      return 0;
    case 'End':
      return last;
    default:
      return null;
  }
}

export function initTabs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-tabs]').forEach((group) => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panelFor = (tab: HTMLElement): HTMLElement | null =>
      group.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`);

    const select = (target: HTMLButtonElement, focus = false): void => {
      for (const tab of tabs) {
        const isSelected = tab === target;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        const panel = panelFor(tab);
        if (panel) panel.hidden = !isSelected;
      }
      if (focus) target.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const next = targetIndex(event.key, index, tabs.length - 1);
        if (next === null) return;
        event.preventDefault();
        select(tabs[next], true);
      });
    });
  });
}
