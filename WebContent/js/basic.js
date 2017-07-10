/**
 * @author: 林家洪
 * @date: 2017.05.
 * @contact: 1048601204@qq.com
 * @description: 与页面顶部那堆东西有关。基本的js
 */

 /**
 * 可以把更多的事件绑定在window.onload 这个事件上面
 * @param  {(Function|string)}  func  要绑定的函数
 */
function addLoadEvent(func) {
	var oldOnload = window.onload;
	// 如果没有绑定任何事件
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldOnload();
			func();
		}
	}
}

/**
 * 键盘快捷键
 */
document.onkeydown = keyFunction;
function keyFunction(e) {
	var e = e || event;
	var keyCode = e.which;

	// 当按下enter的时候，搜索
	if (keyCode == 13) {
		searchBtn.onclick();
	}
}

var searchBtn = document.getElementById('search-btn');
searchBtn.onclick = searchMusic;
function searchMusic() {
	var searchText = search.value;
	if (!searchText) {
		alert('搜索内容不能为空！');
		return;
	}
	localStorage.setItem('searchText', JSON.stringify(searchText));
	window.location.href = '/TopView/SearchMusic.html';
}	