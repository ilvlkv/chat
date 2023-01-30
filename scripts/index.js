// Импорты(сторонние библиотеки)

import { format, isToday, parseISO, formatISO } from 'date-fns';
import 'emoji-picker-element';
import insertTextAtCursor from 'insert-text-at-cursor';
import Cookies from 'js-cookie';

// Импорты(мои модули)

import { addClass, removeClass } from '../scripts/modules/class-changer';
import {
  showModal,
  hideModal,
  showModalConfirmation,
  showModalNotification,
} from '../scripts/modules/modals';
// Инициализация приложения

const me = {
  id: null,
  name: null,
  picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
  token: null,
  email: null,
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

    (me.name = result.name),
      (me.id = result._id),
      (me.token = user_token),
      (me.email = result.email);

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
    const authorization_modal = document.querySelector('.authorization');

    showModal(authorization_modal, false);
    // showAuthorizationModal();
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

// Модальное окно с настройками профиля

const profile_settings_trigger = document.querySelector('.menu__profile-link');
const profile_settings_modal = document.querySelector('.profile-setting');

profile_settings_trigger.addEventListener('click', () => {
  showModal(profile_settings_modal, true);
});

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
  const img_url_node = document.getElementById('profile_img_url');
  const img_url = img_url_node.value;
  const change_profile_img_preview = document.getElementById(
    'change_profile_img-preview'
  );

  img_url_node.value = '';

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
  const new_name_node = document.getElementById('change_profile_new_name');
  const new_name_value = new_name_node.value;

  new_name_node.value = '';

  if (new_name_value) {
    showModalConfirmation(
      'profile-setting',
      null,
      async () => {
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
            showModalNotification(
              'error',
              'profile-setting',
              `Неизвестная ошибка`
            );
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
      },
      () => {
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
          'error',
          'profile-setting',
          'Вы отменили изменения'
        );

        return false;
      }
    );
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

// Авторизация

const authorization_email_submit = document.getElementById(
  'authorization_email_submit'
);

const authorization_token_submit = document.getElementById(
  'authorization_token_submit'
);

authorization_email_submit.addEventListener('click', sendTokenRequestByEmail);

async function sendTokenRequestByEmail() {
  const modal_loader = document.getElementById(
    'authorization_modal_loader'
  ).classList;

  const url = 'https://edu.strada.one/api/user';
  const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  const email_value_node = document.getElementById('authorization_email');
  const email_value = email_value_node.value;

  email_value_node.value = '';

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

const already_have_token_btn = document.querySelector('.already-have-key');

already_have_token_btn.addEventListener('click', showTokenInputField);

function showTokenInputField() {
  authorization_email_submit.removeEventListener(
    'click',
    sendTokenRequestByEmail
  );
  const email_form_block = document.getElementById('email_form_block');

  email_form_block.classList.add('email-input_exit');
  setTimeout(() => {
    email_form_block.classList.remove('email-input_exit');
    email_form_block.classList.add('hidden');
  }, 500);

  already_have_token_btn.classList.add('hidden');

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

  already_have_token_btn.removeEventListener('click', showTokenInputField);
}

function getAuthorizationByToken() {
  const token_value_node = document.getElementById('authorization_token');
  const token_value = token_value_node.value;

  token_value_node.value = '';

  if (token_value && token_value.length > 50) {
    Cookies.set('token', token_value, { expires: 1 });

    showModalNotification(
      'сompleted',
      'authorization',
      'Вы успешно авторизовались!'
    );

    setTimeout(() => {
      const authorization_modal = document.querySelector('.authorization');
      hideModal(authorization_modal);

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

    showModalNotification('error', 'authorization', 'Введите корректный токен');
  }
}

// Создание нового сообщения
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

  renderMessage(is_mine) {
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

    if (is_mine === true) {
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

new_message_submit.addEventListener('click', createNewMessage);

async function createNewMessage() {
  const new_message_Value = new_message_input.value;

  const raw_date = Date.now();

  const date = formatISO(raw_date);
  console.log(date);
  const arr = [
    {
      id: me.id,
      user: { email: me.email, name: me.name },
      text: new_message_Value,
      updatedAt: date,
    },
  ];

  recursive_render(arr, 0);

  return (new_message_input.value = '');
}

async function recursive_render(message_array, message_number) {
  if (message_number === message_array.length) {
    return;
  } else {
    const current_elem = message_array[message_number];

    const id = current_elem._id;
    const author = {
      name: current_elem.user.name,
      picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
    };
    const text = current_elem.text;
    const email = current_elem.user.email;

    let raw_date = current_elem.updatedAt;
    raw_date = parseISO(raw_date);

    let date;

    if (isToday(raw_date) === true) {
      date = format(raw_date, 'kk:mm');
    } else {
      date = format(raw_date, 'dd MMM kk:mm');
    }

    const new_message = new Message({
      id: id,
      author: { author: author.name, picture: author.picture },
      date: date,
      text: text,
    });

    if (email === me.email) {
      new_message.renderMessage(true);
    } else {
      new_message.renderMessage(false);
    }

    if (message_number === message_array.length - 1) {
      new_message.changeLastMessageOfChat();
    }

    message_number += 1;

    return await recursive_render(message_array, message_number);
  }
}

// Варнинги

const empty_chat_warning = document.querySelector('.empty-warning');

// Выбор чата

const test_chat = document.querySelector('.chat');
const chat_interface_block = document.querySelector('.chat-interface');

test_chat.addEventListener('click', showThisChat);

function showThisChat() {
  const this_chat = document.querySelector('.chat:hover');

  const chat_name = this_chat.querySelector('.chat__name').textContent;

  test_chat.classList.add('chat_active');

  if (chat_interface_block.classList.contains('hidden')) {
    chat_interface_block.classList.remove('hidden');
  }

  getMessageHistory(chat_name);
}

async function getMessageHistory(chat_name) {
  if (chat_name === 'Strada test chat') {
    const url = 'https://edu.strada.one/api/messages/';

    let request = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${me.token}`,
      },
    });

    const responce = await request.json();

    const message_history = responce.messages.reverse();

    if (!message_history.length) {
      empty_chat_warning.classList.remove('hidden');
    }
    console.log(message_history);

    recursive_render(message_history, 0);
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
