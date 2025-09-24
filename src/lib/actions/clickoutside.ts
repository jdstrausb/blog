import type { Action } from 'svelte/action';

export const clickoutside: Action<HTMLElement, void> = (node) => {
    const handle_click = (event: MouseEvent) => {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('clickoutside'));
        }
    };

    document.addEventListener('click', handle_click, true);

    return {
        destroy() {
            document.removeEventListener('click', handle_click);
        }
    }
}
