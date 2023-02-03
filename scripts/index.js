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
import { areIntervalsOverlappingWithOptions } from 'date-fns/fp';
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

  const reg =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  if (reg.test(img_url) === false) {
    addClass(img_url_node, 'input_failed');

    setTimeout(() => {
      removeClass(img_url_node, 'input_failed');
    }, 1500);

    change_profile_img_trigger.removeEventListener('click', changeProfileImg);

    setTimeout(() => {
      change_profile_img_trigger.addEventListener('click', changeProfileImg);
    }, 2500);

    showModalNotification('error', 'profile-setting', 'Введите корректный URL');
    return false;
  } else {
    addClass(img_url_node, 'input_confirm');

    change_profile_img_preview.setAttribute('src', img_url);

    showModalConfirmation(
      'profile-setting',
      null,
      () => {
        removeClass(img_url_node, 'input_confirm');
        addClass(img_url_node, 'input_completed');

        setTimeout(() => {
          removeClass(img_url_node, 'input_completed');

          img_url_node.value = '';
        }, 1500);

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
        removeClass(img_url_node, 'input_confirm');
        addClass(img_url_node, 'input_failed');

        setTimeout(() => {
          removeClass(img_url_node, 'input_failed');

          change_profile_img_preview.setAttribute('src', me.picture);
        }, 1500);

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

  if (new_name_value) {
    addClass(new_name_node, 'input_confirm');

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
          removeClass(new_name_node, 'input_confirm');

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
            addClass(new_name_node, 'input_failed');

            setTimeout(() => {
              removeClass(new_name_node, 'input_failed');
            }, 1500);

            showModalNotification(
              'error',
              'profile-setting',
              `Имя должно быть больше 2 символов!`
            );
          } else {
            addClass(new_name_node, 'input_failed');

            setTimeout(() => {
              removeClass(new_name_node, 'input_failed');
            }, 1500);

            showModalNotification(
              'error',
              'profile-setting',
              `Неизвестная ошибка`
            );
          }

          return false;
        }

        if (responce.name) {
          removeClass(new_name_node, 'input_confirm');
          addClass(new_name_node, 'input_completed');

          setTimeout(() => {
            removeClass(new_name_node, 'input_completed');

            new_name_node.value = '';
          }, 1500);

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
        removeClass(new_name_node, 'input_confirm');
        addClass(new_name_node, 'input_failed');

        setTimeout(() => {
          removeClass(new_name_node, 'input_failed');
        }, 1500);

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

  const user_email = {
    email: email_value,
  };

  if (email_value) {
    if (reg.test(email_value) === false) {
      authorization_email_submit.removeEventListener(
        'click',
        sendTokenRequestByEmail
      );

      addClass(email_value_node, 'input_failed');

      setTimeout(() => {
        removeClass(email_value_node, 'input_failed');
      }, 1500);

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
      addClass(email_value_node, 'input_completed');

      setTimeout(() => {
        removeClass(email_value_node, 'input_completed');
      }, 2000);

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

          email_value_node.value = '';
        }, 500);
      }
    }
  } else {
    authorization_email_submit.removeEventListener(
      'click',
      sendTokenRequestByEmail
    );

    addClass(email_value_node, 'input_failed');

    setTimeout(() => {
      removeClass(email_value_node, 'input_failed');
    }, 1500);

    setTimeout(() => {
      authorization_email_submit.addEventListener(
        'click',
        sendTokenRequestByEmail
      );
    }, 2500);

    showModalNotification('error', 'authorization', 'Введите e-mail');
  }
}

function getAuthorizationByToken() {
  const token_value_node = document.getElementById('authorization_token');
  const token_value = token_value_node.value;

  if (token_value) {
    if (token_value && token_value.length > 50) {
      Cookies.set('token', token_value, { expires: 1 });

      addClass(token_value_node, 'input_completed');

      setTimeout(() => {
        removeClass(token_value_node, 'input_completed');
      }, 2500);

      showModalNotification(
        'сompleted',
        'authorization',
        'Вы успешно авторизовались!'
      );

      setTimeout(() => {
        token_value_node.value = '';
        const authorization_modal = document.querySelector('.authorization');
        hideModal(authorization_modal);

        initializeProfile();
      }, 2500);
    } else {
      addClass(token_value_node, 'input_failed');

      setTimeout(() => {
        removeClass(token_value_node, 'input_failed');
      }, 1500);

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

      showModalNotification(
        'error',
        'authorization',
        'Введите корректный токен'
      );
    }
  } else {
    addClass(token_value_node, 'input_failed');

    setTimeout(() => {
      removeClass(token_value_node, 'input_failed');
    }, 1500);

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

    showModalNotification('error', 'authorization', 'Введите токен');
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

async function showThisChat() {
  const this_chat = document.querySelector('.chat:hover');

  const chat_name = this_chat.querySelector('.chat__name').textContent;

  test_chat.classList.add('chat_active');

  if (chat_interface_block.classList.contains('hidden')) {
    chat_interface_block.classList.remove('hidden');
  }

  await getMessageHistoryAndConnectWs(chat_name);

  initRender(current_rendering_group);
  console.log(current_rendering_group);
}

// Получение, создание, работа с сообщениями
class Message {
  constructor(options) {
    this.createdAt = options.createdAt;
    this.user = {
      email: options.user.email,
      name: options.user.name,
      picture: options.user.picture,
    };
    this.text = options.text;
  }

  async render_type_1(group_block) {
    await messageRender(this, 1, group_block);
  }

  async render_type_2(group_block) {
    await messageRender(this, 2, group_block);
  }

  async render_type_3(group_block) {
    await messageRender(this, 3, group_block);
  }

  async render_type_4(group_block) {
    await messageRender(this, 4, group_block);
  }

  async render_type_5(group_block) {
    await messageRender(this, 5, group_block);
  }

  async render_type_6(group_block) {
    await messageRender(this, 6, group_block);
  }

  async render_type_7(group_block) {
    await messageRender(this, 7, group_block);
  }

  async render_type_8(group_block) {
    await messageRender(this, 8, group_block);
  }
}

const messages_buffer = [];
const current_rendering_group = {
  props: {
    date: null,
    last_rendered_message_index: null,
  },
  messages: [],
};

let messages_page_counter = 1;
let messages_date_counter = null;

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
    await groupMessagesByDate(message_history);

    messages_date_counter = [messages_buffer.length - 1];

    await switchMessagesGroup(messages_date_counter);
  }
}

async function groupMessagesByDate(messages_array) {
  for (let element of messages_array) {
    let existingGroups = messages_buffer.filter(
      (group) => group.date == format(parseISO(element.createdAt), 'dd-MM-yyyy')
    );
    if (existingGroups.length > 0) {
      existingGroups[0].messages.push(element);
    } else {
      let newGroup = {
        date: format(parseISO(element.createdAt), 'dd-MM-yyyy'),
        messages: [element],
      };

      messages_buffer.push(newGroup);
    }
  }
}

async function switchMessagesGroup(array_index) {
  current_rendering_group.messages.splice(
    0,
    ...messages_buffer[array_index].messages
  );
  current_rendering_group.props.date = messages_buffer[array_index].date;

  current_rendering_group.props.last_rendered_message_index =
    messages_buffer[array_index].messages.length - 2;
}

async function initRender(data) {
  let i = data.props.last_rendered_message_index;
  let j = data.props.last_rendered_message_index - 20;

  const check = i;

  const messages_container = document.createElement('div');
  messages_container.className = 'chat-interface__messages-group-container';
  messages_container.id = messages_page_counter;

  for (i; i >= j; i--) {
    if (i === -1) {
      const relative_elem = document.querySelector(
        '.chat-interface__messages-block'
      );

      relative_elem.append(messages_container);
      return;
    }

    const item = data.messages[i];

    const options = {
      createdAt: item.createdAt,
      user: {
        email: item.user.email,
        name: item.user.name,
        picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
      },
      text: item.text,
    };

    const new_message = new Message(options);

    const last_message_check = i === 0;

    const email_check = new_message.user.email === me.email;

    if (check === i) {
      if (last_message_check === false) {
        if (email_check === true) {
          await new_message.render_type_1(messages_container);
        }
        if (email_check === false) {
          await new_message.render_type_2(messages_container);
        }
      } else {
        if (email_check === true) {
          await new_message.render_type_7(messages_container);
        }
        if (email_check === false) {
          await new_message.render_type_8(messages_container);
        }
      }
    } else {
      const last_author = messages_container.querySelector('.message');

      if (last_message_check === false) {
        const last_author_check = last_author.classList.contains(
          new_message.user.email
        );

        if (email_check === true && last_author_check === true) {
          await new_message.render_type_3(messages_container);
        }

        if (email_check === true && last_author_check === false) {
          await new_message.render_type_4(messages_container);
        }

        if (email_check === false && last_author_check === true) {
          await new_message.render_type_5(messages_container);
        }

        if (email_check === false && last_author_check === false) {
          await new_message.render_type_6(messages_container);
        }
      } else {
        if (email_check === true) {
          await new_message.render_type_7(messages_container);
        }
        if (email_check === false) {
          await new_message.render_type_8(messages_container);
        }
      }
    }

    if (i == j) {
      const options = {
        root: document.querySelector('.chat-interface__messages-block'),
        rootMargin: '0px',
        threshold: 1,
      };

      const observer = new IntersectionObserver(obs_fnc, options);

      const target = messages_container.querySelector('.message');

      setTimeout(() => {
        observer.observe(target);
      }, 100);

      function obs_fnc(entries, observer) {
        entries.forEach((entry) => {
          const { target, isIntersecting } = entry;

          if (isIntersecting) {
            observer.unobserve(entry.target);

            setTimeout(() => {
              initRender(current_rendering_group);
            }, 100);

            console.log(`Page ${messages_page_counter} is loaded`);
          }
        });
      }
    }
  }

  const relative_elem = document.querySelector(
    '.chat-interface__messages-block'
  );

  return (
    (data.props.last_rendered_message_index = i),
    relative_elem.append(messages_container),
    (messages_page_counter += 1)
  );
}

async function messageRender(data, type, group_block_link) {
  console.log(type);
  const message_template = document.getElementById('message');

  const this_message = message_template.content.cloneNode(true);

  const this_message_block = this_message.querySelector('.message');

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

  this_message_author.innerText = data.user.name;
  this_message_text.innerText = data.text;
  this_message_date.innerText = format(parseISO(data.createdAt), 'kk:mm');
  this_message_author_img.setAttribute('src', data.user.picture);

  addClass(this_message_block, data.user.email);

  if (type === 1 || type === 4) {
    addClass(this_message_block, 'message_outgoing');
    this_message_author_img.setAttribute('src', me.picture);
  }

  if (type === 5 || type === 3) {
    this_message_author_block.remove();
  }

  if (type === 7 || type === 8) {
    const messages_group_template = document.getElementById('messages_group');

    const label_block = messages_group_template.content.cloneNode(true);
    const label_block_text = label_block.querySelector('p');

    const date = parseISO(data.createdAt);
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

    if (messages_date_counter >= 0) {
      messages_date_counter -= 1;

      group_block_link.prepend(this_message_block),
        setTimeout(() => {
          group_block_link.prepend(label_block);
        }, 200);

      setTimeout(() => {
        const options = {
          root: document.querySelector('.chat-interface__messages-block'),
          rootMargin: '0px',
          threshold: 1,
        };

        const observer = new IntersectionObserver(obs_fnc, options);

        const target = document.querySelector('.chat-interface__date-block');

        setTimeout(() => {
          observer.observe(target);
        }, 100);

        function obs_fnc(entries, observer) {
          entries.forEach((entry) => {
            const { target, isIntersecting } = entry;

            if (isIntersecting) {
              observer.unobserve(entry.target);

              switchMessagesGroup(messages_date_counter);
              setTimeout(() => {
                console.log('Dates array switched');
                initRender(current_rendering_group);
              }, 100);
            }
          });
        }
      }, 500);
    } else {
      return (
        group_block_link.prepend(this_message_block),
        group_block_link.prepend(label_block)
      );
    }
  }

  group_block_link.prepend(this_message_block);

  const last_message_author_img = document.querySelector(
    '.chat__last-message-author'
  );
  const last_message_text = document.querySelector('.chat__last-message-text');
  const last_message_date = document.querySelector('.chat__last-message-date');

  last_message_author_img.setAttribute('src', data.user.picture);
  let text = data.text;
  if (text.length > 15) {
    text = `${text.slice(0, 15)}...`;
  }

  last_message_text.innerHTML = text;
  let date = parseISO(data.createdAt);
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

async function getMessageHistoryAndConnectWs(chat_name) {
  await getMessageHistory(chat_name);

  (me.socket = new WebSocket(`wss://edu.strada.one/websockets?${me.token}`)),
    (me.socket.onmessage = function (event) {
      const data = JSON.parse(event.data);

      console.log(`Получено новое сообщение от ${data.user.email}`);

      const item = data;

      const options = {
        createdAt: item.createdAt,
        user: {
          email: item.user.email,
          name: item.user.name,
          picture: 'https://www.hallmarktour.com/img/profile-img.jpg',
        },
        text: item.text,
      };

      const new_message = new Message(options);

      const first_messages_block = document.getElementById('1');

      const last_message = first_messages_block.querySelector(
        '.message:nth-last-child(1)'
      );
      const last_author = last_message.querySelector('.message__author');
      if (
        last_author &&
        last_message.classList.contains(`${data.user.email}`)
      ) {
        return new_message.render_type_5(first_messages_block);
      }

      if (
        last_author &&
        !last_message.classList.contains(`${data.user.email}`)
      ) {
        return new_message.render_type_6(first_messages_block);
      }

      if (
        !last_author &&
        last_message.classList.contains(`${data.user.email}`)
      ) {
        return new_message.render_type_5(first_messages_block);
      }

      if (
        !last_author &&
        !last_message.classList.contains(`${data.user.email}`)
      ) {
        return new_message.render_type_6(first_messages_block);
      }
    });
}

//

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
