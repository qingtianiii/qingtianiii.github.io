/*获取一堆东东*/
var form = document.getElementById('register-form');
var username = document.getElementById('username');
var mobile = document.getElementById('phone');
var email = document.getElementById('email');
// var radio = document.getElementsByName('sex');
var username = document.getElementById('username');
var psd = document.getElementById('password');
var surePsd = document.getElementById('ensurePassword');

/*旁边的提示文字*/
var attention = form.getElementsByClassName('attention');
var input = form.getElementsByTagName('input');

var inputReally = [];
var j = 0;
for (i = 0; i < input.length; i++) {
	if (input[i].getAttribute('type') != 'radio') {
		inputReally[j++] = input[i];
		console.log("##");
	}
}
for(i = 0; i < attention.length; i++) {
	inputReally[i].addEventListener("blur" ,activeCheck.bind(this ,i));
}
// surePsd.addEventListener("blur" ,activeCheck);
function activeCheck(which) {
	/*判断两次密码是否相同*/
	if (which == 2) {
		if (psd.value != surePsd.value) {
			attention[2].innerHTML = '两次密码不相同哟';	
		} else {
			attention[2].innerHTML = '';
		}
		return;
	}
	
	/*判断哪个空没填*/
	switch (which) {
		case 0: {
			if (isUser(username.value) == false) {
				attention[0].innerHTML = '请输入至少六位的字符或数字';	
			} else {
				attention[0].innerHTML = '';	
			}
			break;
		}
		case 1: {
			if(isPsd(psd.value) == false) {
				attention[1].innerHTML = '请输入六到二十位的字符或数字';	
			} else {
				attention[1].innerHTML = '';
			}
			break;
		}	
		case 3: {
			if(isEmail(email.value) == false) {
				attention[3].innerHTML = '请输入正确的email';
			} else {
				attention[3].innerHTML = '';
			}

			break;
		}
		case 4: {
			if(isMobile(mobile.value) == false) {
				attention[4].innerHTML = '请输入正确的手机号';	
			} else {
				attention[4].innerHTML = '';
			}
			break;
		}
	}
}	
/*提交表单时候的验证*/
function check() {
	if (isUser(username.value) == false) {
		alert('请输入正确的用户名');
		return false;
	} else if (isPsd(psd.value) == false) {
		alert('请输入正确的密码');
		return false;
	} else if (isEmail(email.value) == false) {
		alert('请输入正确的email');
		return false;
	} else if (isphone(phone.value) == false) {
		alert('请输入正确的手机号');
		return false;
	} 
	return true;
}


