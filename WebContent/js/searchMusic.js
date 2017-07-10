/**
 * @author: 林家洪
 * @date: 1998.05.17
 * @contact: 1048601204@qq.com
 * @description: 与搜索音乐有关的函数
 */

/**
 * 获得 xhr 对象
 * @return     {(ActiveXObject|XMLHttpRequest)}  The xml http request.
 */
function getXMLHttpRequest() {
	if (XMLHttpRequest) {
		return new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert('不支持XMLHttpRequest');
	}
}
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
 * 使搜索框变宽
 */
function widerSearch() {
	var search = document.getElementById('search');
	var searchBox = document.getElementById('search-box');
	var initWidth = searchBox.offsetWidth;

	search.onfocus = function() {
		searchBox.style.width = '200px';
	}
	search.onblur = function() {
		searchBox.style.width = initWidth + 'px';
	}
}
/**
 * 搜索音乐
 */
function searchMusic() {
	var audio = document.getElementById('audio');
	var search = document.getElementById('search');
	var searchBtn = document.getElementById('search-btn');
	var wantMoreBtn = document.getElementById('want-more-btn');
	// 获得搜索的内容
	var searchText = JSON.parse(localStorage.getItem('searchText'));
	// 获得父元素 song-list
	var songList = document.getElementById('song-list');
	// 记录返回的所有内容
	var allInfo;
	// 当前的歌曲数目
	var pageSongNumber = 10;
	// 搜索歌曲的url
	var searchURL = ''
			+ 'http://s.music.qq.com/fcgi-bin/music_search_new_platform?t=0&n='
			+ pageSongNumber 
	 		+ '&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&needNewCode=0&p=1&catZhida=0&remoteplace=sizer.newclient.next_song&w='
	  	+ searchText;
	/**
	 * 获得搜索的歌曲的信息
	 * @param  {String}  url  搜索歌曲信息的url
	 */
	function getSearchSong(url) {
		var xhr = getXMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && (xhr.status == 0 || xhr.status == 200)) {
				var txt = JSON.parse(xhr.responseText);	
				appendA(txt.data.song.list);
			}
		}	
		xhr.open('POST', 'forwardReq' , true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
		xhr.send('address=' + escape(encodeURIComponent(url)));
	}
	/**
	 * 展现搜索的歌曲结果
	 * @param  {object}  allInfo 包含搜索得到的所有歌曲信息的object
	 */
	function appendA(allInfo) {
		// 那个最下面的 want more 链接。便于在它前面插入元素
		var page = songList.getElementsByTagName('a');
		var ul = [];
		var songInfo = {};
		var str = [];

		for (var i = 0; i < allInfo.length; i++) {
			str[i] = allInfo[i].f.split('|');
			ul[i] = document.createElement('ul');

			var li = [];
			for (var j = 0; j < 4; j++) {
				li[j] = document.createElement('li');
			}
			// 歌名
			li[0].innerHTML = str[i][1];
			// 人名
			li[1].innerHTML = str[i][3];
			// 专辑名
			li[2].innerHTML = str[i][5];
			// 时间
			li[3].innerHTML = converseTime(parseInt(str[i][7])) ;
			for (var j = 0; j < 4; j++) {
				ul[i].appendChild(li[j]);
			}
			songList.insertBefore(ul[i], page[0]);
			ul[i].addEventListener('dblclick', forward.bind(this, i));
		}
		// 包装好点击的歌曲的信息。并跳转到播放页面
		function forward(i) {
			songInfo = {
				song: [ 
					{
						singer: str[i][3], 
						songName: str[i][1],
						time: converseTime(str[i][7]),
						songSrc: getMusic(str[i][0]),
						photo: [getPhoto(str[i][4])],
						singerInfo: '专辑:<br/>' + str[i][5],
						lrcSrc: getLrc(str[i][0])
					}
				]
			};
			localStorage.setItem('songInfo', JSON.stringify(songInfo));
			window.location.href = 'musicPlayer.html';
		}
	}
	/**
	 * 获得播放音乐的url
	 * @param      {string}  id  歌曲对应的id
	 * @return     {string}  url  歌曲对应的url
	 */
	function getMusic(id) {
		var url = 'http://ws.stream.qqmusic.qq.com/' + id + '.m4a?fromtag=46';
		return url;
	}
	/**
	 * 获得歌词的url
	 * @param      {string}  id   歌曲对应的id
	 * @return     {string}       歌曲对应的url
	 */
	function getLrc(id) {
		return 'http://music.qq.com/miniportal/static/lyric/' + id % 100 + '/' + id + '.xml';
	}
	/**
	 * 获得图片的url
	 * @param      {string}  id   歌曲对应的id
	 * @return     {string}       歌曲对应的url
	 */
	function getPhoto(id) {
		return 'http://imgcache.qq.com/music/photo/album_300/' + id % 100 + '/300_albumpic_' + id + '_0.jpg';
	}
	/**
	 * 时间格式的转化
	 * @param      {number}  time    转化前的时间
	 * @return     {string}  转化后的时间
	 */
	function converseTime(time) {
		var minute = Math.floor((time / 60) % 60);
		var second = Math.floor(time % 60);	
		if (second < 10) {
			second = '0' + second;
		}
		if (minute < 10) {
			minute = '0' + minute;
		}
 		return minute + ':' + second;
	}
	/**
	 * 右上角那个显示搜索的文字
	 */
	function printResult() {
		var searchContent = document.getElementsByClassName('search-content')[0];
		// searchContent.innerHTML = '“' + searchText + '”';
	}
	/**
	 * 想要更多相关的歌曲
	 */
	wantMoreBtn.onclick = function() {
		// 如果本来搜索的结果就少于10条，那么点击want more也不会有more了
		var songNumber = songList.getElementsByTagName('ul');
		if (pageSongNumber == 30 || songNumber.length < 11) {
			wantMoreBtn.innerHTML = 'no more';
		} else {
			pageSongNumber += 10;
			searchURL = ''
				+ 'http://s.music.qq.com/fcgi-bin/music_search_new_platform?t=0&n='
				+ pageSongNumber 
		 		+ '&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&needNewCode=0&p=1&catZhida=0&remoteplace=sizer.newclient.next_song&w='
		  	+ searchText;

			removeSearchResult();
			getSearchSong(searchURL);
		}
	}
	/**
	 * 点击 搜索
	 */
	searchBtn.onclick = function() {
		if (!search.value) {
			alert('搜索内容不能为空~');
			return;
		} else {
			searchText = search.value;
			localStorage.setItem('searchText', JSON.stringify(searchText));
			// 让它重置为 10
			pageSongNumber = 10;
			searchURL = ''
				+ 'http://s.music.qq.com/fcgi-bin/music_search_new_platform?t=0&n='
				+ pageSongNumber 
		 		+ '&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&needNewCode=0&p=1&catZhida=0&remoteplace=sizer.newclient.next_song&w='
		  	+ searchText;
			removeSearchResult();
			printResult();
			getSearchSong(searchURL);
			wantMoreBtn.innerHTML = 'want more';
		}
	}
	/**
	 * 移除之前的搜索结果
	 */
	function removeSearchResult() {
		var songNumber = songList.getElementsByTagName('ul');
		// 避免移除掉第一行
		while (songNumber.length > 1) {
			songList.removeChild(songNumber[1]);
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
	// 默认的行为
	keyFunction();
	getSearchSong(searchURL);
	printResult();
}
addLoadEvent(searchMusic);
// addLoadEvent(widerSearch);