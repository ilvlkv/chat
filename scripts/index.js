// Импорты
import uniqid from 'uniqid';
import { format, isToday } from 'date-fns';
import 'emoji-picker-element';
import insertTextAtCursor from 'insert-text-at-cursor';

// Инициализация приложения

const me = uniqid();
const my_name = 'Ilya Volkov';
const my_picture = 'https://www.hallmarktour.com/img/profile-img.jpg';
const hello_message = document.querySelector('.hello-message');

window.addEventListener('load', function init() {
  const profile_picture = document.querySelector('.menu__profile-link img');

  profile_picture.setAttribute('src', my_picture);

  hello_message.innerHTML = `Здравствуйте, ${my_name}! Чтобы начать общение выберите или создайте чат в
  меню :)`;
  hello_message.classList.remove('hidden');

  window.removeEventListener('load', init);
});

// Всплывающее меню
const menu_toggler = document.querySelector('.hamburger');
const menu_block = document.querySelector('.chats-block');

menu_toggler.addEventListener('click', getChatsMenu);

function getChatsMenu() {
  const menu_condition = menu_block.classList;
  const bar_block = document.querySelector('.menu');
  const block_out = document.querySelector('.chat-interface');

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

    if (hide_on_overlay_click === true) {
      modal_overlay.addEventListener('click', exit_event);
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

// Авторизация

const authorization_modal = document.querySelector('.authorization');
const authorization_email_submit = document.getElementById(
  'authorization_email_submit'
);

// window.addEventListener('load', showAuthorizationModal);

function showAuthorizationModal() {
  const authorization_condition = authorization_modal.classList;
  if (authorization_condition.contains('hidden')) {
    setTimeout(() => {
      authorization_condition.remove('modals_entrance');
    }, 500);

    showModalsOverlay(hideAuthorizationModal);

    authorization_condition.remove('hidden');

    authorization_condition.add('modals_entrance');
  }
}

function hideAuthorizationModal() {}

authorization_email_submit.addEventListener('click', sendTokenRequestByEmail);

async function sendTokenRequestByEmail() {
  const url = 'https://edu.strada.one/api/user';
  const email = document.getElementById('authorization_email').value;

  const user_email = {
    email: email,
  };

  let responce = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(user_email),
  });

  if (responce.ok === true) {
    const token_setter_condition =
      document.getElementById('token_setter').classList;

    token_setter_condition.remove('hidden');
    token_setter_condition.add('modals_entrance');

    setTimeout(() => {
      token_setter_condition.remove('modals_entrance');
    }, 500);
  } else {
    alert(`${responce.status}: Bad request`);
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

    if (this_message_author.textContent === me) {
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
  const author = me;
  const profile_picture = my_picture;
  let date = Date.now();
  const id = uniqid();

  if (isToday(date) === true) {
    date = format(date, 'kk:mm');
  } else {
    date = format(date, 'dd MMM kk:mm');
  }

  let options = {
    id: id,
    author: { author: author, picture: profile_picture },
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
