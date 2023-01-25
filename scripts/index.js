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
