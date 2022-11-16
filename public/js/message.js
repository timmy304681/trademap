const authentication = localStorage.getItem('Authorization');
let chatrooms, user, chatmateName, chatmateId, chatmatePhoto;
const socket = io.connect();

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
$('#chatrooms').on('click', async (e) => {
  e.preventDefault();
  // 點入新的聊天室，清除資料
  $('#chat-messages').html('');

  chatmateId = e.target.getAttribute('chatmateId');
  const chatmateInfo = chatrooms.filter((x) => x.chatmate == chatmateId);
  chatmatePhoto = chatmateInfo[0].chatmatePhoto;
  chatmateName = chatmateInfo[0].chatmateName;
  // 改變聊天室對話窗title
  $('#chatmate-title').html(`
     <div class="position-relative">
      <img
        src="${chatmatePhoto}"
        class="rounded-circle mr-1"
        alt="${chatmateName}"
        width="40"
        height="40"
      />
    </div>
    <div class="flex-grow-1 pl-3">
      <div class="text-muted small"><em>Typing...</em></div>
      <strong>${chatmateName}</strong>
    </div>`);

  console.log('Connected to socket');
  socket.emit('chatRoom', {
    user1: user.name,
    user2: chatmateName,
    userId1: user.id,
    userId2: chatmateId,
  });
});

// 傳送訊息
const sendMessage = async (e) => {
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
      whoSend = 'chat-message-right pb-4';
    } else {
      whoSend = 'chat-message-left pb-4';
    }
    //處理時間
    const date = new Date(messages[i].timeStamp);

    const html = `
  <div class=${whoSend}>
    <div>
      <div class="text-muted small text-nowrap mt-2">${date.toLocaleString()}</div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3 mb-2">
      <div class="font-weight-bold mb-1">${messages[i].sender}</div>
      ${messages[i].message}
    </div>
  </div>`;

    $('#chat-messages').append(html);
  }
});

$('#product-select').on('change', (e) => {
  $('#chatrooms').html(``);
  const productSelect = e.target.value;
  let productTarget;
  if (productSelect === 'all') {
    productTarget = chatrooms;
  } else {
    productTarget = chatrooms.filter((x) => x['product_id'] == productSelect);
  }
  console.log(productTarget);
  renderChatrooms(productTarget);
});

// function
function renderChatrooms(chatrooms) {
  // eslint-disable-next-line no-restricted-syntax
  for (chatmate of chatrooms) {
    const chatmateId = chatmate.chatmate;
    const chatmateName = chatmate.chatmateName;
    const chatmatePhoto = chatmate.chatmatePhoto;
    const productTitle = chatmate.title;
    const productId = chatmate['product_id'];
    $('#chatrooms').append(
      `<a chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="list-group-item list-group-item-action border-0">
        <div chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="d-flex align-items-start">
        <img chatmateId="${chatmateId}" chatmateName="${chatmateName}" src="${chatmatePhoto}" class="rounded-circle mr-1" alt="${chatmateName}" width="40" height="40"/>
        <div chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="flex-grow-1 ml-3">${chatmateName}<div  chatmateId="${chatmateId}"  chatmateName="${chatmateName}" class="small">
        <span class="fas fa-circle chat-online"></span> Online</div></div></div>
       </a>`
    );
  }
}

function renderSelect(chatrooms) {
  // eslint-disable-next-line no-restricted-syntax
  for (chatmate of chatrooms) {
    const productTitle = chatmate.title;
    const productId = chatmate['product_id'];
    $('#product-select').append(`
    <option value=${productId}>${productTitle}</option>
    `);
  }
}
