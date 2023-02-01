// Импорты

import {
  format,
  isToday,
  parseISO,
  formatISO,
  isYesterday,
  isThisYear,
  isThisWeek,
} from 'date-fns';
import 'emoji-picker-element';
import insertTextAtCursor from 'insert-text-at-cursor';
import Cookies from 'js-cookie';

import { addClass, removeClass } from '../scripts/modules/class-changer';
import {
  showModal,
  hideModal,
  showModalConfirmation,
  showModalNotification,
} from '../scripts/modules/modals';
import { request } from './modules/fetcher';

// Инициализация приложения

const me = {
  id: null,
  name: null,
  picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
  token: null,
  email: null,
  socket: null,
};

async function initializeProfile() {
  const user_token = Cookies.get('token');

  const profile_img = Cookies.get('my_profile_picture');

  const hello_message = document.querySelector('.hello-message');
  const profile_picture = document.querySelectorAll('.menu__profile-logo img');

  if (user_token) {
    const url = 'https://edu.strada.one/api/user/me';
    const result = await request.get(url, user_token);

    me.name = result.name;
    me.id = result._id;
    me.token = user_token;
    me.email = result.email;

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
// Дефолтный сценарий

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

    let responce = await request.post(url, user_email);

    if (responce.email) {
      hideEmailInput();

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

// Сценарий, если уже есть токен

const already_have_token_btn = document.querySelector('.already-have-key');

already_have_token_btn.addEventListener('click', showTokenInputField);

function showTokenInputField() {
  hideEmailInput();

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

function hideEmailInput() {
  already_have_token_btn.classList.add('hidden');

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
}

// Меню с чатами

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

  getMessageHistoryAndConnectWs(chat_name);
}

// Получение, создание, работа с сообщениями
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

  renderMessage(is_mine, first_message_of_group, previous_author) {
    const message_template = document.getElementById('message');
    const messages_block = document.querySelector(
      '.chat-interface__messages-block'
    );

    const this_message = message_template.content.cloneNode(true);
    const this_message_author_block =
      this_message.querySelector('.message__author');

    const this_message_author = this_message.querySelector(
      '.message__author-name'
    );
    const this_message_author_img = this_message.querySelector(
      '.message__author-img'
    );
    const this_message_text = this_message.querySelector('.message__text');
    const this_message_date = this_message.querySelector('.message__date');

    let date = parseISO(this.date);

    this_message_author.innerHTML = this.author.name;
    this_message_text.innerHTML = this.text;

    this_message_date.innerHTML = format(date, 'kk:mm');

    this_message_author_img.setAttribute('src', this.author.picture);

    if (is_mine === true) {
      this_message.querySelector('.message').classList.add('message_outgoing');
      this_message_author.innerHTML = 'Вы';
    }

    if (previous_author === this.author.name) {
      const parent = this_message_author_block.parentNode;
      parent.removeChild(this_message_author_block);
    }

    if (first_message_of_group === true) {
      const messages_group_template = document.getElementById('messages_group');

      const label_block = messages_group_template.content.cloneNode(true);
      const label_block_text = label_block.querySelector('p');

      const target = format(date, 'dd-MM-yyyy');
      const is_exist = messages_buffer.includes(target);

      if (!is_exist) {
        messages_buffer.push(target);

        let label_date;

        if (isToday(date) === true) {
          label_date = 'Today';
        } else {
          if (isYesterday(date) === true) {
            label_date = 'Yesterday';
          } else {
            if (isThisWeek(date) === true) {
              label_date = format(date, 'EEEE');
            } else {
              if (isThisYear(date) === true) {
                label_date = format(date, 'dd LLLL');
              } else {
                label_date = format(date, 'dd LLLL yyyy');
              }
            }
          }
        }

        label_block_text.innerHTML = label_date;

        setTimeout(() => {
          messages_block.prepend(label_block);
        }, 0);
      }
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
    let text = this.text;
    if (text.length > 15) {
      text = `${text.slice(0, 15)}...`;
    }

    last_message_text.innerHTML = text;
    let date = parseISO(this.date);
    let formatted_date;
    if (isToday(date) === true) {
      formatted_date = format(date, 'kk:mm');
    } else {
      if (isYesterday(date) === true) {
        formatted_date = `Yesterday, ${format(date, 'kk:mm')}`;
      } else {
        if (isThisWeek(date) === true) {
          formatted_date = `${format(date, 'EEEE')},${format(date, 'kk:mm')}`;
        } else {
          if (isThisYear(date) === true) {
            formatted_date = format(date, 'dd LLLL, kk:mm');
          } else {
            formatted_date = format(date, 'dd LLLL yyyy, kk:mm');
          }
        }
      }
    }

    last_message_date.innerHTML = formatted_date;
  }
}

const messages_buffer = [];

const new_message_input = document.getElementById('new_message_input');
const new_message_submit = document.getElementById('new_message_submit');

new_message_submit.addEventListener('click', createNewMessage);

async function createNewMessage() {
  const new_message_Value = new_message_input.value;

  if (new_message_Value) {
    me.socket.send(JSON.stringify({ text: new_message_Value }));

    return (new_message_input.value = '');
  } else {
    return;
  }
}

async function getMessageHistory(chat_name) {
  if (chat_name === 'Strada test chat') {
    const url = 'https://edu.strada.one/api/messages/';

    let responce = await request.get(url, me.token);

    const message_history = responce.messages.reverse();

    if (!message_history.length) {
      empty_chat_warning.classList.remove('hidden');
    }
    const sorted_array = groupMessagesByDate(message_history);

    recursive_group_render(sorted_array);
  }
}

async function getMessageHistoryAndConnectWs(chat_name) {
  await getMessageHistory(chat_name);

  (me.socket = new WebSocket(`ws://edu.strada.one/websockets?${me.token}`)),
    (me.socket.onmessage = function (event) {
      const data = JSON.parse(event.data);

      console.log(`Получено новое сообщение от ${data.user.email}`);

      const arr = [
        {
          id: data._id,
          user: { email: data.user.email, name: data.user.name },
          text: data.text,
          createdAt: data.createdAt,
        },
      ];

      const last_message = document.querySelector('.message');
      const last_author = last_message.querySelector('.message__author');

      if (last_author) {
        if (last_message.classList.contains('message_outgoing')) {
          recursive_render(arr, 0, data.user.name);
        } else {
          if (last_author.textContent === data.user.name) {
            recursive_render(arr, 0, data.user.name);
          }
        }
      } else {
        if (last_message.classList.contains('message_outgoing')) {
          recursive_render(arr, 0, data.user.name);
        } else {
          recursive_render(arr, 0, data.user.name);
        }
      }
    });
}

function groupMessagesByDate(messages_array) {
  let groups = [];

  for (let element of messages_array) {
    let existingGroups = groups.filter(
      (group) => group.date == format(parseISO(element.createdAt), 'dd-MM-yyyy')
    );
    if (existingGroups.length > 0) {
      existingGroups[0].messages.push(element);
    } else {
      let newGroup = {
        date: format(parseISO(element.createdAt), 'dd-MM-yyyy'),
        messages: [element],
      };

      groups.push(newGroup);
    }
  }

  return groups;
}

async function recursive_group_render(group_array) {
  if (Array.isArray(group_array)) {
    group_array.forEach((item) => {
      return recursive_group_render(item);
    });
  } else {
    if (group_array) {
      const group = group_array.messages;
      const date = group_array.date;

      return await recursive_render(group, 0, null);
    }

    return await recursive_group_render();
  }
}

async function recursive_render(
  message_array,
  message_number,
  previous_author
) {
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

    const date = current_elem.createdAt;

    const new_message = new Message({
      id: id,
      author: { author: author.name, picture: author.picture },
      date: date,
      text: text,
    });

    const last_author = previous_author;

    if (email === me.email) {
      new_message.author.picture = me.picture;

      if (message_number === 0) {
        new_message.renderMessage(true, true, last_author);
      } else {
        previous_author = author.name;
        new_message.renderMessage(true, false, last_author);
      }
    } else {
      if (message_number === 0) {
        new_message.renderMessage(false, true, last_author);
      } else {
        new_message.renderMessage(false, false, last_author);
      }
    }

    if (message_number === message_array.length - 1) {
      new_message.changeLastMessageOfChat(true);
    }

    previous_author = author.name;

    message_number += 1;

    return await recursive_render(
      message_array,
      message_number,
      previous_author
    );
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

// Варнинги

const empty_chat_warning = document.querySelector('.empty-warning');
