
//检验用户
function checkIdentity() {
	var username = document.getElementById('username');
	var psd = document.getElementById('password');
	console.log(psd.value);
	if (isUser(username.value) == false) {
		alert('请输入至少6位的字符或数字的用户名');
		return false;
	} else if(isPsd(psd.value) == false) {
		alert('请输入6-20位的字符或数字的密码')
		return false;
	}
}