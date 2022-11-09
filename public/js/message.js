// //之後會從localstorage拿
// const USER_ID = 1;
// const USER_NAME = 'admin_1';

// 一進入此頁面就socket連線
const socket = io.connect();
console.log(socket);

// 不同userId列出不同聊天室
$('#btn-submit').on('click', async (e) => {
  e.preventDefault();
  // 換不用id清除聊天室
  $('#chatrooms').html('');

  // 將用戶資訊存localstorage，寫死
  let USER_NAME;
  console.log($('#userId')[0].value);
  if ($('#userId')[0].value == 1) {
    USER_NAME = 'admin_1';
  } else if ($('#userId')[0].value == 2) {
    USER_NAME = 'admin_2';
  } else if ($('#userId')[0].value == 3) {
    USER_NAME = 'admin_3';
  } else if ($('#userId')[0].value == 4) {
    USER_NAME = 'admin_4';
  }
  console.log(USER_NAME);

  localStorage.setItem('USER_ID', $('#userId')[0].value);
  localStorage.setItem('USER_NAME', USER_NAME);

  const params = {
    params: {
      userId: $('#userId')[0].value,
    },
  };
  const response = await axios.get('/api/1.0/chatrooms', params);
  console.log(response);
  // eslint-disable-next-line no-restricted-syntax
  for (chatmate of response.data) {
    $('#chatrooms').append(
      `<a  userId="${chatmate.chatmate}" class="list-group-item list-group-item-action border-0">
     <div userId="${chatmate.chatmate}" class="d-flex align-items-start">
    <img  userId="${chatmate.chatmate}"
      src="${chatmate.chatematePhoto}"
      class="rounded-circle mr-1"
      alt="${chatmate.chatmateName}"
      width="40"
      height="40"
    />
    <div  userId="${chatmate.chatmate}" class="flex-grow-1 ml-3">
    ${chatmate.chatmateName}
      <div  userId="${chatmate.chatmate}" class="small"><span class="fas fa-circle chat-online"></span> Online</div>
    </div>
  </div>
</a>`
    );
  }
});

// 點擊聊天室彈出對話視窗
$('#chatrooms').on('click', async (e) => {
  e.preventDefault();
  // 點入新的聊天室，清除資料
  $('#chat-messages').html('');
  const params = {
    params: {
      id: e.target.getAttribute('userId'),
    },
  };
  const response = await axios.get('/api/1.0/users', params);
  const user = response.data[0];
  //將chatmate資料存在localstorage
  localStorage.setItem('chatamateId', user.id);
  localStorage.setItem('chatamateName', user.name);
  // 改變聊天室對話窗title
  $('#chatmate-title').html(`
     <div class="position-relative">
      <img
        src="${user.photo}"
        class="rounded-circle mr-1"
        alt="${user.name}"
        width="40"
        height="40"
      />
    </div>
    <div class="flex-grow-1 pl-3">
      <div class="text-muted small"><em>Typing...</em></div>
      <strong>${user.name}</strong>
    </div>`);

  //check for connect
  const USER_ID = localStorage.getItem('USER_ID');
  const USER_NAME = localStorage.getItem('USER_NAME');
  console.log('Connected to socket');
  socket.emit('chatRoom', {
    user1: USER_NAME,
    user2: `${user.name}`,
    userId1: USER_ID,
    userId2: `${user.id}`,
  });
});

// 傳送訊息
const sendMessage = async (e) => {
  if (e.which === 13 || e.type === 'click') {
    // Emit to server input
    const chatmateId = localStorage.getItem('chatamateId');
    const chatmateName = localStorage.getItem('chatamateName');

    const USER_NAME = localStorage.getItem('USER_NAME');
    socket.emit('input', {
      user1: USER_NAME,
      user2: chatmateName,
      sender: USER_NAME,
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
  const USER_NAME = localStorage.getItem('USER_NAME');

  for (let i = 0; i < messages.length; i++) {
    let whoSend;
    if (messages[i].sender === USER_NAME) {
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
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
      <div class="font-weight-bold mb-1">${messages[i].sender}</div>
      ${messages[i].message}
    </div>
  </div>`;

    $('#chat-messages').append(html);
  }
});
