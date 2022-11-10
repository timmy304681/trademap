(async () => {
  const authentication = await localStorage.getItem('Authorization');
  // 若無token就不做任何call api驗證
  if (authentication == null) {
    return;
  }
  // 有token，就call api驗證
  const params = {
    headers: { 'content-type': 'application/json', authorization: authentication },
  };
  try {
    const response = await axios.get(`/api/1.0/users`, params);
    console.log(response);
    const userProfile = response.data;
    await Swal.fire({
      icon: 'success',
      title: '會員已登入',
      text: `會員：${userProfile.name} ，已登入`,
      footer: `將跳轉至訂單管理頁面`,
    });
    location.href = '/order';
  } catch (err) {
    console.log(err);
  }
})();

$('#btn-signin').on('click', async (e) => {
  console.log('hi');
  e.preventDefault();
  const postData = {
    email: $('#input-email').val(),
    password: $('#input-password').val(),
  };

  try {
    const response = await axios.post(`/api/1.0/users/signin`, postData);
    console.log(response);
    const userProfile = response.data;
    const authentication = 'Bearer ' + userProfile.token;
    // 將token存在localStorage
    localStorage.setItem('Authorization', authentication);

    await Swal.fire({
      icon: 'success',
      title: '會員登入成功',
      text: `會員：${userProfile.name} ，歡迎登入`,
      footer: `將跳轉至訂單管理頁面`,
    });
    location.href = '/order';
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: '會員登入失敗',
      text: `帳號或密碼錯誤 `,
    });
  }
});
