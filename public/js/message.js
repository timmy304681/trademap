const authentication = localStorage.getItem('Authorization');
let chatrooms, user, chatmateName, chatmateId, chatmatePhoto;
const socket = io.connect();
$('#message-page').addClass('tm-main-color');
(async () => {
  // 此頁面只有會員能看見，驗證會員身分
  try {
    const params = {
      headers: { 'content-type': 'application/json', authorization: authentication },
    };
    const response = await axios.get(`/api/1.0/users`, params);
  } catch (err) {
    console.log(err);
    await Swal.fire({
      icon: 'warning',
      title: '請登入會員',
      text: `此頁面為會員專屬`,
      footer: `將跳轉至登入註冊頁面`,
    });
    location.href = '/profile';
  }

  const params = {
    headers: { authorization: authentication },
  };
  const response = await axios.get('/api/1.0/chatrooms', params);
  chatrooms = response.data.chatrooms;
  user = response.data.user;

  renderChatrooms(chatrooms);
  renderSelect(chatrooms);
})();

// 點擊聊天室彈出對話視窗
$(document).on('click', '.tm-chatroom-item', async (e) => {
  $('#chateroom-box-area').show();
  e.preventDefault();
  // 點入新的聊天室，清除資料
  $('#chateroom-box').removeAttr('hidden');
  $('.clone-item').remove();

  let chatmateId;
  chatmateId = $(e.target).attr('chatmateId');
  if (chatmateId === undefined) {
    chatmateId = $(e.target).parents('a').attr('chatmateId');
  }
  const chatmateInfo = chatrooms.filter((x) => x.chatmate == chatmateId);
  chatmatePhoto = chatmateInfo[0].chatmatePhoto;
  chatmateName = chatmateInfo[0].chatmateName;
  // 改變聊天室對話窗title
  $('#chateroom-title-img').attr('src', chatmatePhoto);
  $('#chateroom-title-name').html(chatmateName);

  socket.emit('chatRoom', {
    user1: user.name,
    user2: chatmateName,
    userId1: user.id,
    userId2: chatmateId,
  });
});

// 傳送訊息
const sendMessage = async (e) => {
  if ($('#message-input').val().trim() === '') {
    // 不接受純空白
    return;
  }
  if (e.which === 13 || e.type === 'click') {
    // Emit to server input

    socket.emit('input', {
      user1: user.name,
      user2: chatmateName,
      sender: user.name,
      message: $('#message-input').val(),
      timeStamp: Date.now(),
    });

    // 清空輸入
    $('#message-input').val('');
  }
};
// 鍵盤輸入和按send都可以進行輸入
$('#message-input').on('keydown', sendMessage);
$('#btn-message-send').on('click', sendMessage);

// 接收server訊息
socket.on('output', (data) => {
  const messages = data[0].messages;
  for (let i = 0; i < messages.length; i++) {
    let whoSend;
    if (messages[i].sender === user.name) {
      whoSend = 'chat-message-right';
    } else {
      whoSend = 'chat-message-left';
    }
    //處理時間
    const date = new Date(messages[i].timeStamp);

    const newDom = $('.chat-message-clone').first().clone();
    newDom.removeAttr('hidden');
    newDom.addClass('clone-item');
    newDom.addClass(whoSend);
    newDom.find('.message-time').html(date.toLocaleString());
    newDom.find('.message-sender').html(messages[i].sender);
    newDom.find('.message-content').html(messages[i].message);
    $('#chat-messages').append(newDom);
  }
  // 渲染訊息永遠會讓scroll到最底
  $('#chat-messages').animate({ scrollTop: $('#chat-messages').prop('scrollHeight') }, 1000);
});

$('#product-select').on('change', (e) => {
  $('.chatroom-clone-item').remove();

  const productSelect = e.target.value;
  let productTarget;
  if (productSelect === 'all') {
    productTarget = chatrooms;
  } else {
    productTarget = chatrooms.filter((x) => x['product_id'] == productSelect);
  }

  renderChatrooms(productTarget);
});

// function
function renderChatrooms(chatrooms) {
  // eslint-disable-next-line no-restricted-syntax
  for (chatmate of chatrooms) {
    const chatmateId = chatmate.chatmate;
    const { chatmateName, chatmatePhoto } = chatmate;

    const newDom = $('.tm-chatroom-item').first().clone();
    newDom.removeAttr('hidden');
    newDom.addClass('chatroom-clone-item');
    newDom.attr('chatmateId', chatmateId).attr('chatmateName', chatmateName);
    newDom.children('div').children('img').attr('src', chatmatePhoto);
    newDom.children('div').children('div').html(chatmateName);
    $('#chatrooms').append(newDom);
  }
}

function renderSelect(chatrooms) {
  // eslint-disable-next-line no-restricted-syntax
  const hashTable = {};
  chatrooms.map((x) => {
    hashTable[`${x['product_id']}`] = x.title;
  });

  Object.keys(hashTable).forEach((key) => {
    const productTitle = hashTable[key];
    const productId = key;
    const newDom = $('.option-clone').first().clone();
    newDom.val(productId).html(productTitle);
    $('#product-select').append(newDom);
  });
}
