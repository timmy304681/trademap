//此頁面只有會員能看見
(async () => {
  const authentication = await localStorage.getItem('Authorization');
  // 若無token就不做任何call api驗證
  if (authentication == null) {
    await Swal.fire({
      icon: 'warning',
      title: '請登入會員',
      text: `此頁面為會員專屬`,
      footer: `將跳轉至登入註冊頁面`,
    });
    return (location.href = '/profile');
  }
  // 有token，就call api驗證
  const params = {
    headers: { 'content-type': 'application/json', authorization: authentication },
  };
  try {
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
})();

// 一進入此頁面就socket連線
const socket = io.connect();
console.log(socket);
let chatrooms, user, chatmateName, chatmateId, chatmatePhoto;

// 一進入此頁面就針對token拿資料
(async () => {
  $('#chatrooms').html('');

  const Authorization = localStorage.getItem('Authorization');
  const params = {
    headers: { authorization: Authorization },
  };
  const response = await axios.get('/api/1.0/chatrooms', params);
  chatrooms = response.data.chatrooms;
  user = response.data.user;

  // eslint-disable-next-line no-restricted-syntax
  for (chatmate of chatrooms) {
    const chatmateId = chatmate.chatmate;
    const chatmateName = chatmate.chatmateName;
    const chatmatePhoto = chatmate.chatmatePhoto;

    $('#chatrooms').append(
      `<a  chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="list-group-item list-group-item-action border-0">
     <div chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="d-flex align-items-start">
    <img  chatmateId="${chatmateId}" chatmateName="${chatmateName}"
      src="${chatmatePhoto}"
      class="rounded-circle mr-1"
      alt="${chatmateName}"
      width="40"
      height="40"
    />
    <div  chatmateId="${chatmateId}" chatmateName="${chatmateName}" class="flex-grow-1 ml-3">
    ${chatmateName}
      <div  chatmateId="${chatmateId}"  chatmateName="${chatmateName}" class="small"><span class="fas fa-circle chat-online"></span> Online</div>
    </div>
  </div>
</a>`
    );
  }
})();

// 點擊聊天室彈出對話視窗
$('#chatrooms').on('click', async (e) => {
  e.preventDefault();
  // 點入新的聊天室，清除資料
  $('#chat-messages').html('');
  // const Authorization = localStorage.getItem('Authorization');
  // const params = {
  //   headers: { authorization: Authorization },
  // };
  // const response = await axios.get('/api/1.0/users', params);
  // const user = response.data[0];
  // //將chatmate資料存在localstorage
  // localStorage.setItem('chatamateId', user.id);
  // localStorage.setItem('chatamateName', user.name);

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

  // check for connect
  // const USER_ID = localStorage.getItem('USER_ID');
  // const USER_NAME = localStorage.getItem('USER_NAME');
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
