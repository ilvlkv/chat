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
// Уведомления в модальных окнах

function showModalNotification(status, modal, notification_text) {
  const data = initModalNotification(false, modal);

  if (notification_text) {
    if (status === 'error') {
      showErrorModalNotification(notification_text, data);
    } else {
      showCompletedModalNotification(notification_text, data);
    }
  } else {
    if (status === 'error') {
      showErrorModalNotification(null, data);
    } else {
      showCompletedModalNotification(null, data);
    }
  }
}
function showModalConfirmation(
  modal,
  confirmation_text,
  resolve_func,
  reject_func
) {
  const data = initModalNotification(true, modal);

  data.confirm_button.addEventListener('click', function save() {
    data.confirm_button.removeEventListener('click', save);

    addClass(data.block, 'notification_exit');

    setTimeout(() => {
      data.relative_node.removeChild(data.block);

      resolve_func();
    }, 500);
  });
  data.cancel_button.addEventListener('click', function cancel() {
    data.cancel_button.removeEventListener('click', cancel);

    addClass(data.block, 'notification_exit');

    setTimeout(() => {
      data.relative_node.removeChild(data.block);

      reject_func();
    }, 500);
  });

  addClass(data.block, 'modal__notification_confirm');

  if (confirmation_text) {
    data.text.innerHTML = `${confirmation_text}`;
  } else {
    data.text.innerHTML = `Хотите подтвердить действие?`;
  }

  data.relative_node.append(data.block);

  addClass(data.block, 'notification_entrance');

  setTimeout(() => {
    removeClass(data.block, 'notification_entrance');
  }, 200);
}

function initModalNotification(is_confirmation, modal) {
  let template;

  if (is_confirmation === true) {
    template = document.getElementById('modal_confirmation');
  } else {
    template = document.getElementById('modal_notification');
  }

  const clone = template.content.cloneNode(true);

  const elements = {};

  elements.relative_node = document.querySelector(`.${modal}`);
  elements.block = clone.querySelector('.modal__notification');
  elements.text = clone.querySelector('.modal__notificaion-text');

  if (is_confirmation === true) {
    elements.confirm_button = clone.querySelector(
      '.modal__notification-btn_confirm'
    );
    elements.cancel_button = clone.querySelector(
      '.modal__notification-btn_cancel'
    );
  }

  return elements;
}
function showErrorModalNotification(notification_text, elements) {
  addClass(elements.block, 'modal__notification_error');

  if (notification_text) {
    elements.text.innerHTML = `Ошибка: ${notification_text}`;
  } else {
    elements.text.innerHTML = `Ошибка: запрос не выполнен`;
  }

  elements.relative_node.append(elements.block);

  addClass(elements.block, 'notification_entrance');

  setTimeout(() => {
    removeClass(elements.block, 'notification_entrance');
  }, 200);

  setTimeout(() => {
    addClass(elements.block, 'notification_exit');
  }, 1500);

  setTimeout(() => {
    elements.relative_node.removeChild(elements.block);
  }, 2000);
}
function showCompletedModalNotification(notification_text, elements) {
  addClass(elements.block, 'modal__notification_completed');

  if (notification_text) {
    elements.text.innerHTML = `${notification_text}`;
  } else {
    elements.text.innerHTML = `Успешно!`;
  }

  elements.relative_node.append(elements.block);

  addClass(elements.block, 'notification_entrance');

  setTimeout(() => {
    removeClass(elements.block, 'notification_entrance');
  }, 200);

  setTimeout(() => {
    addClass(elements.block, 'notification_exit');
  }, 1500);

  setTimeout(() => {
    elements.relative_node.removeChild(elements.block);
  }, 2000);
}

export { showModal, hideModal, showModalConfirmation, showModalNotification };
