function comment() {
	var textarea = document.getElementsByTagName('textarea')[0];
	var myBtn = document.getElementsByClassName('my-comment-btn')[0];
	// var userComment = document.getElementsByClassName('user-comment')[0];
	// 上面的赞  
	var topGood = document.getElementsByClassName('good')[0];
	var topGoodNumber = document.getElementsByClassName('point-good-number')[0];
	var isPointTopGood = false;
	// 下方评论的大框  
 	var otherComment = document.getElementsByClassName('other-comment')[0];
	topGood.onclick = function() {
		if (isPointTopGood == false) {
			topGood.innerHTML = '取消赞';
			topGoodNumber.innerHTML = parseInt(topGoodNumber.innerHTML) + 1;
			isPointTopGood = true;
		} else {
			topGood.innerHTML = '赞';
			topGoodNumber.innerHTML = parseInt(topGoodNumber.innerHTML) - 1 ;
			isPointTopGood = false;
		}
		
	}

	textarea.onfocus = function() {
		if (textarea.value == '评论') {
			textarea.value = '';
		}
		textarea.className = 'comment-on';
	}
	textarea.onblur = function () {
		if (textarea.value == '') {
			textarea.value = '评论';
			textarea.className = 'comment-off';
		}
	}
	myBtn.onclick = function() {
		// 评论右边
		var username = document.createElement('span');
		username.innerHTML = '我' + ': ';
		var text = document.createElement('span');
		text.innerHTML = textarea.value;
		var mainContent = document.createElement('div');
		mainContent.className = 'main-content';

		var date = new Date();
		var userCommentTime = document.createElement('span');
		userCommentTime.className = 'user-comment-time';
		userCommentTime.innerHTML = '' 
			+ date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ' '
			+ date.getHours() + ":" + date.getMinutes();
								
		mainContent.appendChild(username);
		mainContent.appendChild(text);
		var commentRight = document.createElement('div');
		commentRight.appendChild(mainContent);
		commentRight.appendChild(userCommentTime);
		// 评论左边   
		var userHeadPic = document.createElement('img');
		userHeadPic.src = 'img/wuyuetian1.jpg';
		var commentLeft = document.createElement('div');
		commentLeft.className = 'comment-left';
		commentLeft.appendChild(userHeadPic);

		var userComment = document.createElement('div');
		userComment.className = 'user-comment';
		userComment.appendChild(commentLeft);
		userComment.appendChild(commentRight);
		// 插入dom
		otherComment.insertBefore(userComment, textarea);

		textarea.value = '';
		textarea.onblur();
	}
}
comment();