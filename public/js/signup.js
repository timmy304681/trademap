$('#btn-signup').on('click', async (e) => {
  console.log('hi');
  e.preventDefault();
  const postData = {
    email: $('#input-email').val(),
    name: $('#input-name').val(),
    password: $('#input-password').val(),
  };

  try {
    const response = await axios.post(`/api/1.0/users/signup`, postData);
    console.log(response);
    const userProfile = response.data;
    const authentication = 'Bearer ' + userProfile.token;
    // 將token存在localStorage
    localStorage.setItem('Authorization', authentication);

    await Swal.fire({
      icon: 'success',
      title: '會員註冊成功',
      text: `會員：${userProfile.name} ，歡迎註冊`,
      footer: `將跳轉至訂單管理頁面`,
    });
    location.href = '/order';
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: '會員註冊失敗',
      text: err.response.data.error,
    });
  }
});
