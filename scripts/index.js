// Импорты
import uniqid from 'uniqid';
import { format, isToday } from 'date-fns';

// Инициализация приложения

const me = uniqid();
const my_picture = 'https://www.hallmarktour.com/img/profile-img.jpg';

window.addEventListener('load', function () {
  const profile_picture = document.querySelector('.menu__profile-link img');

  profile_picture.setAttribute('src', my_picture);
});

// Всплывающее меню
const menu_toggler = document.querySelector('.hamburger');
const menu_block = document.querySelector('.chats-block');

menu_toggler.addEventListener('click', getChatsMenu);

function getChatsMenu() {
  const menu_condition = menu_block.classList;
  const bar_block = document.querySelector('.menu');
  const block_out = document.querySelector('.chat-interface');

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
const profile_settings_modal = document.querySelector(
  '.modal__profile-setting'
);

profile_settings_trigger.addEventListener('click', showProfileSettingsModal);

function showProfileSettingsModal() {
  const modals_overlay_condition = modal_overlay.classList;
  const profile_settings_condition = profile_settings_modal.classList;

  if (modals_overlay_condition.contains('modals_hidden')) {
    setTimeout(() => {
      modals_overlay_condition.remove('modals_entrance');
    }, 500);
    modals_overlay_condition.remove('modals_hidden');
    modals_overlay_condition.add('modals_entrance');

    modal_overlay.addEventListener('click', hideProfileSettingsModal);
  }
}

function hideProfileSettingsModal() {
  const modals_overlay_condition = modal_overlay.classList;

  setTimeout(() => {
    modals_overlay_condition.add('modals_hidden');
    modals_overlay_condition.remove('modals_exit');
  }, 500);
  modals_overlay_condition.add('modals_exit');
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

test_chat.addEventListener('click', showThisChat);

function showThisChat() {
  test_chat.classList.add('chat_active');

  const chat_interface_block = document.querySelector('.chat-interface');
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
