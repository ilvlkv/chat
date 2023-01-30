import { addClass, removeClass } from '../modules/class-changer';

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

export { showModalConfirmation, showModalNotification };
