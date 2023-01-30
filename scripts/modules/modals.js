import { add } from 'date-fns';
import { addClass, removeClass } from './class-changer';

const modal_overlay = document.querySelector('.modals');

function showModalsOverlay(exit_event, hide_on_overlay_click) {
  if (modal_overlay.classList.contains('hidden')) {
    setTimeout(() => {
      removeClass(modal_overlay, 'modals_entrance');
    }, 500);
    removeClass(modal_overlay, 'hidden');
    addClass(modal_overlay, 'modals_entrance');

    if (exit_event) {
      if (hide_on_overlay_click === true) {
        modal_overlay.addEventListener('click', exit_event);
      }
    }
  }
}

function hideModalsOverlay(exit_event) {
  setTimeout(() => {
    addClass(modal_overlay, 'hidden');
    removeClass(modal_overlay, 'modals_exit');
  }, 500);
  addClass(modal_overlay, 'modals_exit');

  modal_overlay.removeEventListener('click', exit_event);
}

function showModal(modal_node, hide_on_overlay_click) {
  if (modal_node.classList.contains('hidden')) {
    setTimeout(() => {
      removeClass(modal_node, 'modals_entrance');
    }, 500);

    showModalsOverlay(() => {
      hideModal(modal_node, event);
    }, hide_on_overlay_click);

    removeClass(modal_node, 'hidden');
    addClass(modal_node, 'modals_entrance');
  }
}

function hideModal(modal_node, event) {
  if (event) {
    if (event.target == modal_overlay) {
      setTimeout(() => {
        addClass(modal_node, 'hidden');
        removeClass(modal_node, 'modals_exit');
      }, 500);

      addClass(modal_node, 'modals_exit');

      hideModalsOverlay(() => {
        hideModal(modal_node, event);
      });
    } else {
      return;
    }
  } else {
    setTimeout(() => {
      addClass(modal_node, 'hidden');
      removeClass(modal_node, 'modals_exit');
    }, 500);

    addClass(modal_node, 'modals_exit');

    hideModalsOverlay(() => {
      hideModal(modal_node, event);
    });
  }
}

export { showModal, hideModal };
