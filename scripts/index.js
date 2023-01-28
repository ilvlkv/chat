// Импорты

import { format, isToday } from 'date-fns';
import 'emoji-picker-element';
import insertTextAtCursor from 'insert-text-at-cursor';
import Cookies from 'js-cookie';

// Инициализация приложения

const me = {
  id: null,
  name: null,
  picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
};

async function initializeProfile() {
  const user_token = Cookies.get('token');

  const profile_img = Cookies.get('my_profile_picture');

  const hello_message = document.querySelector('.hello-message');
  const profile_picture = document.querySelectorAll('.menu__profile-logo img');

  if (user_token) {
    const url = 'https://edu.strada.one/api/user/me';

    const request = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user_token}`,
      },
    });

    const result = await request.json();

    (me.name = result.name), (me.id = result._id);

    if (profile_img) {
      me.picture = profile_img;
    }

    window.removeEventListener('load', initializeProfile);

    setTimeout(() => {
      profile_picture.forEach((item) => {
        item.setAttribute('src', me.picture);
      });

      hello_message.innerHTML = `Здравствуйте, ${me.name}! Чтобы начать общение выберите или создайте чат в
    меню :)`;
      hello_message.classList.remove('hidden');
    }, 0);
  } else {
    profile_picture.forEach((item) => {
      item.setAttribute('src', me.picture);
    });

    showAuthorizationModal();
  }
}

window.addEventListener('load', initializeProfile);

// Всплывающее меню
const menu_toggler = document.querySelector('.hamburger');
const menu_block = document.querySelector('.chats-block');

menu_toggler.addEventListener('click', getChatsMenu);

function getChatsMenu() {
  const menu_condition = menu_block.classList;
  const bar_block = document.querySelector('.menu');
  const block_out = document.querySelector('.chat-interface');
  const hello_message = document.querySelector('.hello-message');

  if (!hello_message.classList.contains('hidden')) {
    hello_message.classList.add('hidden');
  }

  if (menu_condition.contains('chats-block_hidden')) {
    setTimeout(() => {
      menu_condition.remove('chats-block_entrance');
    }, 500);
    bar_block.classList.add('menu_without-shadow');
    menu_condition.add('chats-block_entrance');
    menu_condition.remove('chats-block_hidden');

    block_out.addEventListener('click', function hide() {
      setTimeout(() => {
        menu_condition.add('chats-block_hidden');
        bar_block.classList.remove('menu_without-shadow');
        menu_condition.remove('chats-block_exit');
      }, 500);
      menu_condition.add('chats-block_exit');
      menu_toggler.click();

      block_out.removeEventListener('click', hide);
    });
  } else {
    setTimeout(() => {
      menu_condition.add('chats-block_hidden');
      bar_block.classList.remove('menu_without-shadow');
      menu_condition.remove('chats-block_exit');
    }, 500);
    menu_condition.add('chats-block_exit');
  }
}

// Модальные окна

const modal_overlay = document.querySelector('.modals');

const profile_settings_trigger = document.querySelector('.menu__profile-link');
const profile_settings_modal = document.querySelector('.profile-setting');

profile_settings_trigger.addEventListener('click', showProfileSettingsModal);

function showModalsOverlay(exit_event, hide_on_overlay_click) {
  const modals_overlay_condition = modal_overlay.classList;

  if (modals_overlay_condition.contains('hidden')) {
    setTimeout(() => {
      modals_overlay_condition.remove('modals_entrance');
    }, 500);
    modals_overlay_condition.remove('hidden');

    modals_overlay_condition.add('modals_entrance');

    if (exit_event) {
      if (hide_on_overlay_click === true) {
        modal_overlay.addEventListener('click', exit_event);
      }
    }
  }
}

function hideModalsOverlay(exit_event) {
  const modals_overlay_condition = modal_overlay.classList;

  setTimeout(() => {
    modals_overlay_condition.add('hidden');
    modals_overlay_condition.remove('modals_exit');
  }, 500);
  modals_overlay_condition.add('modals_exit');

  modal_overlay.removeEventListener('click', exit_event);
}

// Модальное окно с настройками профиля

function showProfileSettingsModal() {
  const profile_settings_condition = profile_settings_modal.classList;

  if (profile_settings_condition.contains('hidden')) {
    setTimeout(() => {
      profile_settings_condition.remove('modals_entrance');
    }, 500);

    showModalsOverlay(hideProfileSettingsModal, true);

    profile_settings_condition.remove('hidden');

    profile_settings_condition.add('modals_entrance');
  }
}

function hideProfileSettingsModal(event) {
  const profile_settings_condition = profile_settings_modal.classList;

  if (event.target === modal_overlay) {
    setTimeout(() => {
      profile_settings_condition.add('hidden');
      profile_settings_condition.remove('modals_exit');
    }, 500);

    hideModalsOverlay(hideProfileSettingsModal);

    profile_settings_condition.add('modals_exit');
  } else {
    return;
  }
}

// Настройки профиля

const change_profile_img_trigger = document.getElementById(
  'change_profile_img-trigger'
);
const change_profile_name_trigger = document.getElementById(
  'change_profile_new_name-trigger'
);

change_profile_img_trigger.addEventListener('click', changeProfileImg);
change_profile_name_trigger.addEventListener('click', changeProfileName);

function changeProfileImg() {
  const img_url = document.getElementById('profile_img_url').value;
  const change_profile_img_preview = document.getElementById(
    'change_profile_img-preview'
  );

  const reg =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  if (reg.test(img_url) === false) {
    change_profile_img_trigger.removeEventListener('click', changeProfileImg);

    setTimeout(() => {
      change_profile_img_trigger.addEventListener('click', changeProfileImg);
    }, 2500);

    showModalNotification('error', 'profile-setting', 'Введите корректный URL');
    return false;
  } else {
    change_profile_img_preview.setAttribute('src', img_url);

    showModalConfirmation(
      'profile-setting',
      null,
      () => {
        change_profile_img_trigger.removeEventListener(
          'click',
          changeProfileImg
        );

        setTimeout(() => {
          change_profile_img_trigger.addEventListener(
            'click',
            changeProfileImg
          );

          Cookies.set('my_profile_picture', img_url, { expires: 365 });

          const profile_picture = document.querySelectorAll(
            '.menu__profile-logo img'
          );
          profile_picture.forEach((item) => {
            item.setAttribute('src', img_url);
          });
        }, 2500);

        showModalNotification(
          'completed',
          'profile-setting',
          'Вы успешно сохранили изменения!'
        );
      },
      () => {
        change_profile_img_trigger.removeEventListener(
          'click',
          changeProfileImg
        );

        setTimeout(() => {
          change_profile_img_trigger.addEventListener(
            'click',
            changeProfileImg
          );
        }, 2500);

        showModalNotification(
          'error',
          'profile-setting',
          'Вы отменили изменения'
        );

        return false;
      }
    );
  }
}

async function changeProfileName() {
  const new_name_value = document.getElementById(
    'change_profile_new_name'
  ).value;

  if (new_name_value) {
    const new_name = { name: new_name_value };
    const url = 'https://edu.strada.one/api/user';
    const user_token = Cookies.get('token');

    let request = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${user_token}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(new_name),
    });

    let responce = await request.json();

    if (responce.message) {
      change_profile_name_trigger.removeEventListener(
        'click',
        changeProfileName
      );

      setTimeout(() => {
        change_profile_name_trigger.addEventListener(
          'click',
          changeProfileName
        );
      }, 2500);

      if (responce.message === 'Name is too short. Minimum 2 symbols') {
        showModalNotification(
          'error',
          'profile-setting',
          `Имя должно быть больше 2 символов!`
        );
      } else {
        showModalNotification('error', 'profile-setting', `Неизвестная ошибка`);
      }

      return false;
    }

    if (responce.name) {
      change_profile_name_trigger.removeEventListener(
        'click',
        changeProfileName
      );

      setTimeout(() => {
        change_profile_name_trigger.addEventListener(
          'click',
          changeProfileName
        );
      }, 2500);

      showModalNotification(
        'completed',
        'profile-setting',
        'Имя профиля успешно изменено'
      );
    }
  } else {
    change_profile_name_trigger.removeEventListener('click', changeProfileName);

    setTimeout(() => {
      change_profile_name_trigger.addEventListener('click', changeProfileName);
    }, 2500);

    showModalNotification(
      'error',
      'profile-setting',
      `Поле не должно быть пустым!`
    );
  }
}

// Уведомления в модальных окнах

function showModalNotification(status, modal, notification_text) {
  const notification_template = document.getElementById('modal_notification');
  const modal_block = document.querySelector(`.${modal}`);

  const this_notification = notification_template.content.cloneNode(true);
  const this_notification_block = this_notification.querySelector(
    '.modal__notification'
  );
  const this_notification_text = this_notification.querySelector(
    '.modal__notificaion-text'
  );

  if (notification_text) {
    if (status === 'error') {
      this_notification_block.classList.add('modal__notification_error');

      this_notification_text.innerHTML = `Ошибка: ${notification_text}`;

      modal_block.append(this_notification_block);

      this_notification_block.classList.add('notification_entrance');

      setTimeout(() => {
        this_notification_block.classList.remove('notification_entrance');
      }, 200);

      setTimeout(() => {
        this_notification_block.classList.add('notification_exit');
      }, 1500);

      setTimeout(() => {
        modal_block.removeChild(this_notification_block);
      }, 2000);
    } else {
      this_notification_block.classList.add('modal__notification_completed');

      this_notification_text.innerHTML = `${notification_text}`;

      modal_block.append(this_notification_block);

      this_notification_block.classList.add('notification_entrance');

      setTimeout(() => {
        this_notification_block.classList.remove('notification_entrance');
      }, 200);

      setTimeout(() => {
        this_notification_block.classList.add('notification_exit');
      }, 1500);

      setTimeout(() => {
        modal_block.removeChild(this_notification_block);
      }, 2000);
    }
  } else {
    if (status === 'error') {
      this_notification_block.classList.add('modal__notification_error');

      this_notification_text.innerHTML = `Ошибка: запрос не выполнен`;

      modal_block.append(this_notification_block);

      this_notification_block.classList.add('notification_entrance');

      setTimeout(() => {
        this_notification_block.classList.remove('notification_entrance');
      }, 200);

      setTimeout(() => {
        this_notification_block.classList.add('notification_exit');
      }, 1500);

      setTimeout(() => {
        modal_block.removeChild(this_notification_block);
      }, 2000);
    } else {
      this_notification_block.classList.add('modal__notification_completed');

      this_notification_text.innerHTML = `Успешно!`;

      modal_block.append(this_notification_block);

      this_notification_block.classList.add('notification_entrance');

      setTimeout(() => {
        this_notification_block.classList.remove('notification_entrance');
      }, 200);

      setTimeout(() => {
        this_notification_block.classList.add('notification_exit');
      }, 1500);

      setTimeout(() => {
        modal_block.removeChild(this_notification_block);
      }, 2000);
    }
  }
}

function showModalConfirmation(
  modal,
  confirmation_text,
  resolve_func,
  reject_func
) {
  const notification_template = document.getElementById('modal_notification');
  const modal_block = document.querySelector(`.${modal}`);

  const this_notification = notification_template.content.cloneNode(true);
  const this_notification_block = this_notification.querySelector(
    '.modal__notification'
  );
  const this_notification_text = this_notification.querySelector(
    '.modal__notificaion-text'
  );

  const buttons_block = document.createElement('div');
  buttons_block.className = 'modal__notification-buttons-block';

  const confirm_button = document.createElement('button');

  confirm_button.className =
    'modal__notification-btn modal__notification-btn_confirm';
  confirm_button.addEventListener('click', function save() {
    confirm_button.removeEventListener('click', save);

    this_notification_block.classList.add('notification_exit');

    setTimeout(() => {
      modal_block.removeChild(this_notification_block);

      resolve_func();
    }, 500);
  });

  const cancel_button = document.createElement('button');
  cancel_button.className =
    'modal__notification-btn modal__notification-btn_cancel';
  cancel_button.addEventListener('click', function cancel() {
    cancel_button.removeEventListener('click', cancel);

    this_notification_block.classList.add('notification_exit');

    setTimeout(() => {
      modal_block.removeChild(this_notification_block);

      reject_func();
    }, 500);
  });

  buttons_block.append(confirm_button);
  buttons_block.append(cancel_button);

  this_notification_block.append(buttons_block);

  if (confirmation_text !== null) {
    this_notification_block.classList.add('modal__notification_confirm');

    this_notification_text.innerHTML = `${confirmation_text}`;

    modal_block.append(this_notification_block);

    this_notification_block.classList.add('notification_entrance');

    setTimeout(() => {
      this_notification_block.classList.remove('notification_entrance');
    }, 200);
  } else {
    this_notification_block.classList.add('modal__notification_confirm');

    this_notification_text.innerHTML = `Хотите подтвердить действие?`;

    modal_block.append(this_notification_block);

    this_notification_block.classList.add('notification_entrance');

    setTimeout(() => {
      this_notification_block.classList.remove('notification_entrance');
    }, 200);
  }
}

// Авторизация

const authorization_modal = document.querySelector('.authorization');

const authorization_email_submit = document.getElementById(
  'authorization_email_submit'
);

const authorization_token_submit = document.getElementById(
  'authorization_token_submit'
);

function showAuthorizationModal() {
  const authorization_condition = authorization_modal.classList;
  if (authorization_condition.contains('hidden')) {
    setTimeout(() => {
      authorization_condition.remove('modals_entrance');
    }, 500);

    showModalsOverlay();

    authorization_condition.remove('hidden');

    authorization_condition.add('modals_entrance');
  }
}

function hideAuthorizationModal() {
  const authorization_modal_condition =
    document.querySelector('.authorization').classList;

  setTimeout(() => {
    authorization_modal_condition.remove('modals_exit');
    authorization_modal_condition.add('hidden');
  }, 500);

  authorization_modal_condition.add('modals_exit');
}

authorization_email_submit.addEventListener('click', sendTokenRequestByEmail);

async function sendTokenRequestByEmail() {
  const modal_loader = document.getElementById(
    'authorization_modal_loader'
  ).classList;

  const url = 'https://edu.strada.one/api/user';
  const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  const email_value = document.getElementById('authorization_email').value;
  const user_email = {
    email: email_value,
  };

  if (reg.test(email_value) === false) {
    authorization_email_submit.removeEventListener(
      'click',
      sendTokenRequestByEmail
    );

    setTimeout(() => {
      authorization_email_submit.addEventListener(
        'click',
        sendTokenRequestByEmail
      );
    }, 2500);

    showModalNotification(
      'error',
      'authorization',
      'Введен некорректный e-mail'
    );
    return false;
  } else {
    modal_loader.remove('hidden');

    let responce = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(user_email),
    });

    if (responce.ok === true) {
      modal_loader.add('hidden');

      const token_setter_condition =
        document.getElementById('token_setter').classList;

      token_setter_condition.remove('hidden');
      token_setter_condition.add('modals_entrance');

      setTimeout(() => {
        token_setter_condition.remove('modals_entrance');
        authorization_token_submit.addEventListener(
          'click',
          getAuthorizationByToken
        );
      }, 500);
    }
  }
}

function getAuthorizationByToken() {
  const token_value = document.getElementById('authorization_token').value;

  if (token_value) {
    Cookies.set('token', token_value, { expires: 1 });

    showModalNotification(
      'сompleted',
      'authorization',
      'Вы успешно авторизовались!'
    );

    setTimeout(() => {
      hideAuthorizationModal();
      hideModalsOverlay(hideAuthorizationModal);

      initializeProfile();
    }, 2500);
  } else {
    authorization_token_submit.removeEventListener(
      'click',
      getAuthorizationByToken
    );

    setTimeout(() => {
      authorization_token_submit.addEventListener(
        'click',
        getAuthorizationByToken
      );
    }, 2500);

    showModalNotification('error', 'authorization', 'Введите полученный токен');
  }
}

// Создание нового сообщения

const message_storage = [];
class Message {
  constructor(options) {
    (this.id = options.id),
      (this.author = {
        name: options.author.author,
        picture: options.author.picture,
      }),
      (this.date = options.date),
      (this.text = options.text);
  }

  renderMessage() {
    const message_template = document.getElementById('message');
    const messages_block = document.querySelector(
      '.chat-interface__messages-block'
    );

    const this_message = message_template.content.cloneNode(true);
    const this_message_author = this_message.querySelector(
      '.message__author-name'
    );
    const this_message_author_img = this_message.querySelector(
      '.message__author-img'
    );
    const this_message_text = this_message.querySelector('.message__text');
    const this_message_date = this_message.querySelector('.message__date');

    this_message_author.innerHTML = this.author.name;
    this_message_text.innerHTML = this.text;
    this_message_date.innerHTML = this.date;
    this_message_author_img.setAttribute('src', this.author.picture);

    if (this_message_author.textContent === me.name) {
      this_message.querySelector('.message').classList.add('message_outgoing');
      this_message_author.innerHTML = 'Вы';
    }

    setTimeout(() => {
      messages_block.prepend(this_message);
    }, 0);
  }

  changeLastMessageOfChat() {
    const last_message_author_img = document.querySelector(
      '.chat__last-message-author'
    );
    const last_message_text = document.querySelector(
      '.chat__last-message-text'
    );
    const last_message_date = document.querySelector(
      '.chat__last-message-date'
    );

    last_message_author_img.setAttribute('src', this.author.picture);
    last_message_text.innerHTML = this.text;
    last_message_date.innerHTML = this.date;
  }
}

const new_message_input = document.getElementById('new_message_input');
const new_message_submit = document.getElementById('new_message_submit');

new_message_submit.addEventListener('click', registerNewMessage);

function registerNewMessage() {
  const text = new_message_input.value;
  const author = me.name;
  const id = me.id;
  const author_picture = me.picture;
  let date = Date.now();

  if (isToday(date) === true) {
    date = format(date, 'kk:mm');
  } else {
    date = format(date, 'dd MMM kk:mm');
  }

  let options = {
    id: id,
    author: { author: author, picture: author_picture },
    date: date,
    text: text,
  };

  const new_message = new Message(options);

  message_storage.push(new_message);

  if (!empty_chat_warning.classList.contains('hidden')) {
    empty_chat_warning.classList.add('hidden');
  }

  new_message_input.value = '';

  new_message.renderMessage();
  new_message.changeLastMessageOfChat();
}

// Варнинги

const empty_chat_warning = document.querySelector('.empty-warning');

// Выбор чата

const test_chat = document.querySelector('.chat');
const chat_interface_block = document.querySelector('.chat-interface');

test_chat.addEventListener('click', showThisChat);

function showThisChat() {
  test_chat.classList.add('chat_active');

  const messages_list = document.querySelector(
    '.chat-interface__messages-block'
  );

  if (chat_interface_block.classList.contains('hidden')) {
    chat_interface_block.classList.remove('hidden');
  }

  if (messages_list.childNodes.length < 4) {
    empty_chat_warning.classList.remove('hidden');
  }
}

// Меню с емодзи

const emoji_trigger = document.querySelector('.emoji-picker__show-btn');

emoji_trigger.addEventListener('mouseover', getEmojiMenu);

function getEmojiMenu() {
  const emoji_menu = document.querySelector('.emoji-picker');

  if (emoji_menu.classList.contains('hidden')) {
    emoji_menu.classList.remove('hidden');
  } else {
    emoji_menu.addEventListener('mouseout', function () {
      emoji_menu.classList.add('hidden');
    });
  }
}

document
  .querySelector('emoji-picker')
  .addEventListener('emoji-click', (event) => {
    insertTextAtCursor(
      document.getElementById('new_message_input'),
      event.detail.unicode
    );
  });
