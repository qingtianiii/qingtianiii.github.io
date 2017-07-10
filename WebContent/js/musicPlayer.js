/**
 * @author: 林家洪
 * @date: 2017.05.18
 * @contact: 1048601204@qq.com
 * @description: 存放与音乐播放有关的函数
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
 * 根据ie或者非ie浏览器来获得xhr对象
 * @return xhr对象
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
 * 获得歌曲有关信息
 * @param  {String} songInfoURL 储存歌曲信息文件的地址
 */
function getSongInfo(songInfoURL) {
	var xhr = getXMLHttpRequest();
	var url = 'music/' + songInfoURL;
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 0 || xhr.status == 200)) {
			// 把json转化为js后，传递给playMusic函数
			playMusic(JSON.parse(xhr.responseText).song);
		}
	}
	xhr.open('GET',url , true);
	xhr.send(null);
}
/**
 * 播放音乐
 * @param  {Array} song 储存有关歌曲信息的数组
 */
function playMusic(song) {
	var bgImg = document.getElementById('bg-img');
	var audio = document.getElementById('audio');
	var play = document.getElementById('play');
	var next = document.getElementById('next');
	var pre = document.getElementById('pre');
	// 播放列表
	var playerList = document.getElementById('player-list');
	var musicList = document.getElementsByClassName('list-song')[0].getElementsByTagName('ul');
	// 图片上的信息
	var musicInfo = document.getElementById('music-info');
	// 记录当前歌曲的序号
	var position = 0;
	// 用于随机播放的时候，保存返回上一首的歌曲索引（不过只能保存一首，很尴尬）
  var tempPosition;
  // 播放列表那里的播放序号
  var listNumber = document.getElementsByClassName('list-number');
  // 判断是否点了暂停，true表示点了
	var isPauseClick = true;
  // 空格键控制播放
  var spaceKeyClickTimes = 0;

	var musicLoop = document.getElementById('loop');
	// 判断当前循环模式
	var loopMode = 0;
	var clickLoopTimes = 0;
	
	// 进度条相关
	// 进度条上的圆圈
	var musicProccessCircle = document.getElementById('music-proccess-circle'); 
	// 进度条那条线
	var musicProccessLine = document.getElementById('music-proccess-line');
	// 当前进度
	var nowProcess = musicProccessLine.getElementsByTagName('span')[0];
	// 进度条最大的宽度
	var maxWidth = musicProccessLine.offsetWidth;
	// 与播放时间有关
	var musicTime = document.getElementById('music-time');
	var musicCurrentTime = musicTime.getElementsByTagName('span')[0];
	var musicAllTime = musicTime.getElementsByTagName('span')[1];
	// 取消歌词滚动，进度条的计时器
	var timesUp;

	// 音量相关
	var volumeBtn = document.getElementById('volume-btn');
	var volumeCircle = document.getElementById('volume-circle');
	var volumeLine = document.getElementById('volume-line');
	var nowVolume = volumeLine.getElementsByTagName('span')[0];
	var maxVolumeWidth = volumeLine.offsetWidth;
	var isMuted = false;
	// 标记当前的声音位置。当点击了静音后再点击不要静音后，此时的位置是和静音前一样的
	var volumeMark;
	
	// 图片盒子
	var musicPic = document.getElementById('music-pic');
	// 当前图片的序号
	var picPosition = 0;
	// 取消轮播定时器
	var picTimesUp;

	// 歌词相关
	// 装歌词的盒子
	var playerLrc = document.getElementById('player-lrc');
	// 每句歌词的<p>标签
	var pLrc = [];
	// <p>标签里面的内容，也就是歌词
  var pLrcText = [];
  // 储存歌词对应的播放时间的
  var second = [];
  // 当前歌词高亮位置
  var lrcIndex = 0;
  // 用来得到歌词中间位置，从而让歌词居中的时候自己滚动。总高除以2得到的
  var judge = playerLrc.offsetHeight / 2;
  // 记录开始时 歌词最中间那个位置
  var limit;
  // 判断滚动条距离顶部的位置的，默认为0。(不是距离，距离要再乘上一个数)
  var scrollPosition = 0;
  // 让滚动条默认处于顶部
  playerLrc.scrollTop = 0;

  // 搜索相关
  var searchBtn = document.getElementById('search-btn');
  var search = document.getElementById('search');
  // 判断是不是在线获取资源
  var online = false;
  // 暂时储存歌曲信息
  var tempSong;
  var singerInfo = document.getElementsByClassName('singer-info')[0];
  
	// 如果是在线搜索歌曲的话，可以得到return的歌曲信息，那么就加到一开始得到的歌曲信息上
	if ((tempSong = getSongInfoOnline()) != false) {
		song[4] = tempSong[0];
		position = 4;
	}	
	// 初始化
	formatMusic();
	changeMusic();
	// 键盘快捷键，按了对应的键后执行对应的函数
	document.onkeydown = keyFunction;
	/**
	 * 初始化音乐播放。也就是刚刚进去这个播放界面的时候会执行
	 */
	function formatMusic() {
		if (online == false) {
			// 获取歌曲资源
			audio.src = song[position].fileName + '.mp3';
			// 获得歌词
			getLrc(song[position].fileName);
		} else {
			audio.src = song[position].songSrc;
			getLrc(song[position].lrcSrc);
		}
		// 如果音乐可以播放了 就显示当前播放时间和歌曲时间
		audio.addEventListener(
			'canplay', 
			function() {
				musicCurrentTime.innerHTML = converseTime(audio.currentTime);
				musicAllTime.innerHTML = ' / ' + converseTime(audio.duration);
			}
		);
		// 获得图片
		appendPic();
		// 获取歌手信息
		singerInfo.innerHTML = song[position].singerInfo;
		// 播放器显示的歌曲名和歌手
		musicInfo.innerHTML = song[position].singer + ' - ' + song[position].songName;
		// 背景图片
		bgImg.src = song[position].photo[0];
	}
	/**
	 * 获取歌词
	 * @param  {String} lrcURL 歌词文件所在地址
	 */
	function getLrc(lrcURL) {
		// 如果是搜索到的歌曲，就木有歌词（其实是得到的是gb2312编码的xml文件
		// 但是不知怎么转码为UTF-8编码的)
		if (position == 4) {
			var pLrc = document.createElement('p');
			pLrc.className = 'lrc';
			pLrc.innerHTML = '暂无歌词';
			playerLrc.appendChild(pLrc);
			return;
		} else {
			var xhr = getXMLHttpRequest();
			var url = lrcURL +'.lrc';
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && (xhr.status == 0 || xhr.status == 200)) {
					parseLrc(xhr.responseText);
				}
			}
			xhr.open('GET',url , true);
			xhr.send(null);
		}
	}
	/**
	 * 对获得的歌词进行解析
	 * @param  {String} lrc 没经过处理的歌词
	 */
	function parseLrc(lrc) {
		// 把时间取出，存好
		lrcTime = lrc.match(/\d\d:\d\d\.\d\d/g);
		// 把时间抹去
		var lrcArray = lrc.replace(/[\[\\d{2}:\d{2}\.\d{2}\]]/g, '');
		// 以换行符分割
		var lrcVal = lrcArray.split('\n');
		// 记录时间分割后的分和秒
		var lrcLine;
		// 重新给second数组分配空间。用于切换歌曲的时候用的。
		second = [];
		// 按行分割成数组
		for (var i = 0; i < lrcTime.length; i++) {
			// 以 : 为分隔符 获取分和秒
			lrcLine = lrcTime[i].split(':');
			// 以秒为单位，储存每句歌词对应的时间
			second[i] = parseInt(lrcLine[0]) * 60 + parseInt(lrcLine[1]);
		}
		appendLrc(lrcVal);
	}
	/**
	 * 添加歌词
	 * @param  {Array} lrcVal 储存着每一句歌词
	 */
	function appendLrc(lrcVal) {
		// 重新给pLrc数组分配空间。用于切换歌曲的时候用的。
		pLrc = [];
		// 创建<p>标签，把歌词内容放入，在添加到DOM中
		for (var i = 0; i < lrcVal.length; i++) {
			pLrc[i] = document.createElement('p');
			pLrcText[i] = document.createTextNode(lrcVal[i]);
			pLrc[i].className = 'lrc';
			pLrc[i].appendChild(pLrcText[i]);
			playerLrc.appendChild(pLrc[i]);
		}
		// 找出歌词中间的位置。滚动歌词从这个位置开始滚动
		for (var i = 0; i < lrcVal.length; i++) {
			if (pLrc[i].offsetTop > judge) {
				limit = i;	
				break;
			}
		}
	}
	/**
	 * 移除歌词。当切换歌曲的时候，需要先移除再添加歌词
	 */
	function removeLrc() {
		var playerLrc = document.getElementById('player-lrc');
		var pLrc = playerLrc.getElementsByTagName('p');
		var i = 0;

		while (pLrc.length > 0) {
			playerLrc.removeChild(pLrc[i]);
		}
	}
	/**
	 * 歌词滚动
	 */
	function scrollLrc() {
	  // 当到最后一行歌词的时候，需要进行别的处理
	  // 判断当最后储存的时间小于播放时间的时候，让歌词高亮
	  if (lrcIndex + 1 == second.length) {
	  	if (second[lrcIndex] < audio.currentTime) {
	  		pLrc[lrcIndex].className = 'now-lrc' + ' ' + 'lrc';
	  		pLrc[lrcIndex - 1].setAttribute('class', 'lrc');
	  	} else {
	  		return;
	  	}
	  } else { 
			if (second[lrcIndex + 1] > audio.currentTime) {
				pLrc[lrcIndex].className = 'now-lrc' + ' ' + 'lrc';
				if (lrcIndex != 0) {
					pLrc[lrcIndex - 1].setAttribute('class', 'lrc');
				}
			} else {
				lrcIndex++;
			}
		}
		// 当歌词还不是最后一句的时候
		if (lrcIndex < pLrc.length) {
			// 如果歌词距离歌词框的顶部的距离大于歌词框高度的一半 就要开始滚动
			if (pLrc[lrcIndex].offsetTop > judge) {
				scrollPosition++;
				// 33 是根据字体大小以及每句歌词的margin-bottom得到的。比它们两个相加大一点
				playerLrc.scrollTop = (lrcIndex - limit) * 33;
				// judge是要时刻保持在歌词框的中间位置的。所以要跟着滚动条的变化而变化
				judge = playerLrc.offsetHeight / 2 + scrollPosition * 33;			
				return;
			}
			// 说明还没开始滚动，滚动条要自己滚回去
			if (scrollPosition == 0) {
				playerLrc.scrollTop = 0;
			}
		}
	}
	/**
	 * 当进度条被点或被拉的时候，歌词跟着变
	 */
	function lrcAutoChange() {
		for (var i = 0; i < second.length; i++) {
			// 让所有歌词都不要亮
			pLrc[i].className = 'lrc';
			// 找到播放时间对应的位置 i
			if (second[i] < audio.currentTime && second[i + 1] > audio.currentTime) {
				var move = (i - limit) * 33;
				// 歌词滚动函数那里的有关变量也要跟着改变
				if (move > 0) {
					playerLrc.scrollTop = move;
					scrollPosition = i - limit;
				} else {
					playerLrc.scrollTop = 0;
					scrollPosition = 0;
				}
				lrcIndex = i;
				judge = playerLrc.offsetHeight / 2 + scrollPosition * 33;
			}
		}
	}
	/**
	 * 播放歌曲
	 */
	play.onclick = function() {
		// 如果是点了暂停键的，那再点开始时，就让它继续播放，而不是重新加载
		// 如果是第一次播放，那也是直接走else那条路
		if (isPauseClick == false) {
			if (position != 4) {
				audio.src = song[position].fileName + '.mp3';
			} else {
				audio.src = song[position].songSrc;
			}
			audio.play();
			// 移除原来的歌词
			removeLrc();
			// 移除原来的轮播和图片
			clearInterval(picTimesUp);
			removePic();
			// 让歌词重新开始高亮
			lrcIndex = 0;
			scrollPosition = 0;	
			judge = playerLrc.offsetHeight / 2;
			// 获取图片
			appendPic();
			// 获取歌词
			getLrc(song[position].fileName);
		} else {
			audio.play();
			isPauseClick = false;
		}
		// 当前播放歌曲高亮
		highLightMusic();
		// 背景图片
		bgImg.src = song[position].photo[0];
		// 图片轮播
		slidePic();
		// 获取歌手信息
		singerInfo.innerHTML = song[position].singerInfo;
		// 移除原来的标志
		removePlaying();
		// 显示播放时候的标志
		appendPlaying();
		// 隐藏播放图标，显示暂停图标
		play.style.display = "none";
		pause.style.display = 'inline-block';
		// 进度条的圆圈会发光
		shineCircle();
		// 判断当前是否可以播放
		audio.addEventListener(
			'canplay' ,
			function () {
				musicCurrentTime.innerHTML = converseTime(audio.currentTime);
				musicAllTime.innerHTML = ' / ' + converseTime(audio.duration);
				musicInfo.innerHTML = song[position].singer + ' - ' + song[position].songName;
			}
		);
		// 歌词开始滚 进度条开始跑
		timesUp = setInterval(
			function () {
				musicCurrentTime.innerHTML = converseTime(audio.currentTime);
				musicProccessCircle.style.left = (audio.currentTime / audio.duration * maxWidth) + 'px';
				nowProcess.style.width = musicProccessCircle.style.left;
				scrollLrc();
			}, 
			500
		);
	};
	/**
	 * 暂停播放
	 */
	pause.onclick = function() {
		isPauseClick = true;
		audio.pause();
		removePlaying();
		play.style.display = "inline-block";
		pause.style.display = 'none';
		shineCircle();
		// 清除图片轮播的计时 歌词进度条滚动的计时
		clearInterval(picTimesUp);
		clearInterval(timesUp);
	};
	/**
	 * 上一首歌曲
	 */
	pre.onclick = function() {
		if (loopMode == 2) {
			position = tempPosition;
		} else {
				if (position == 0) {
					position = musicList.length - 1;
				} else {
					position--;
				}
		} 
		// 如果不是新搜索到的那一首
		if (position != 4) {
			audio.src = song[position].fileName + '.mp3';
		} else {
			audio.src = song[position].songSrc;
		}

		isPauseClick = false;
		play.onclick();
	};
	/**
	 * 下一首歌曲
	 */
	next.onclick = function() {
		// 如果当前模式是随机播放的话
		if (loopMode == 2) {
			tempPosition = shufflePlay();
		} else {
				if (position == musicList.length - 1) {
					position = 0;
				} else {
					position++;
				}
		}
		// 如果不是新搜索到的那一首
		if (position != 4) {
			audio.src = song[position].fileName + '.mp3';
		} else {
			audio.src = song[position].songSrc;
		}
		
		isPauseClick = false;
		play.onclick();
	};
	/**
	 * highlight正在播放的歌曲
	 */
	function highLightMusic() {
		for (var i = 0; i < musicList.length; i++) {
			musicList[i].setAttribute('class', '');
		}
		musicList[position].setAttribute('class', musicList[position].getAttribute('class') + ' ' + 'playing');
	}
	/**
	 *  通过点击列表来更换歌曲
	 */
	function changeMusic() {
		for (var i = 0; i < musicList.length; i++) {
				musicList[i].addEventListener('dblclick', change.bind(this, i));
		}

		function change(i) {
			if (position != 4) {
				audio.src = song[position].fileName + '.mp3';
			} else {
				audio.src = song[position].songSrc;
			}

			position = i;
			audio.addEventListener(
				'canplay', 
				function () {
					musicAllTime.innerHTML = ' / ' + converseTime(audio.duration);
				}
			);
			isPauseClick = false;
			removePlaying();
			play.onclick();
			highLightMusic();
		}
	}
	/**
	 * 循环问题
	 */
	musicLoop.onclick = function() {
		// 根据这个参数来判断当前的循环状态
		// 0为列表循环 1为单曲循环 2为随机播放
		clickLoopTimes++;
		loopMode = clickLoopTimes % 3;
		if (loopMode == 0) {
			musicLoop.className = 'order';
		} else if (loopMode == 1) {
			musicLoop.className = 'only';
		} else {
			musicLoop.className = 'shuffle';
		}
	};
	/**
	 * 播放完后,根据循环模式，自动播放下一首
	 */
	audio.onended = function() {
		if (loopMode == 0) {
			next.onclick();
		} else if (loopMode == 1) {
			play.onclick();
		} else {
			shufflePlay();
			next.onclick();
		}
	};
	/**
	 * 拖动进度条的时候执行的函数
	 * @param  {object}  e  鼠标事件
	 */
	musicProccessCircle.onmousedown = function(e) {
		// ie或者非ie上获取鼠标事件
		var ev = window.event || e;
		// 鼠标初始位置
		var mouseLeftInit = ev.clientX;
		// 圆的初始位置 就是距离进度条左边的距离
		var circleInit = musicProccessCircle.offsetLeft;
		// 要对document对象用，而不是musicProccessCircle
		document.onmousemove = function(e) {
			var eve = window.event || e;
			// 鼠标现在的位置
			var mouseLeft = eve.clientX;
			// 鼠标移动的距离
			var move = mouseLeft - mouseLeftInit;
			// 不能超出进度条范围，to 就是相对于起点的位置
			var to = Math.max(0 ,Math.min(maxWidth ,move + circleInit));
			// 当前进度条和圆圈的距离左边的距离
			musicProccessCircle.style.left = to + 'px';
			nowProcess.style.width = to + 'px';
			// 计算拖动进度条后，对应的时间
			musicCurrentTime.innerHTML = converseTime(audio.currentTime);
			audio.currentTime = to * Math.round(audio.duration) / maxWidth;
			// 歌词也要跟着变化
			lrcAutoChange();
			// 避免拉动进度条的时候，会选中其他文字
			window.getSelection() ? window.getSelection().removeAllRanges() : window.getSelection().empty();
		}
		document.onmouseup = function() {
			document.onmousemove = null;
		}
	};
	/**
	 * 可以通过点击进度条来调节进度
	 * @param  {object}  e 鼠标事件
	 */
	musicProccessLine.onclick = function(e) {
		// 和拖动进度条的基本差不多
		var eve = window.event || e;
		var mouseLeft = eve.clientX;
		var circleInit = musicProccessCircle.offsetLeft;
		var move = mouseLeft - musicProccessCircle.getBoundingClientRect().left;
		var to = Math.max(0 ,Math.min(maxWidth, move + circleInit));

		musicProccessCircle.style.left = to + 'px';
		nowProcess.style.width = to + 'px';

		audio.currentTime = to * Math.round(audio.duration) / maxWidth;
		musicCurrentTime.innerHTML = converseTime(audio.currentTime);

		lrcAutoChange();
	};
	/**
	 * 通过拖动来调节音量
	 * @param  {<type>}  e  鼠标事件
	 */
	volumeCircle.onmousedown = function(e) {
		// 定义鼠标初始位置
		var ev = window.event || e;
		var mouseLeftInit = ev.clientX;
		// 定义进度条那个圆 距离父元素左边的位置
		var circleInit = volumeCircle.offsetLeft;
		// 要对document对象用
		document.onmousemove = function(e) {
			// 定义鼠标后来的位置，两者相减，得到鼠标在x轴上的位移
			var eve = window.event || e;
			var mouseLeft = eve.clientX;
			var move = mouseLeft - mouseLeftInit;
			// 不能超出进度条范围，to 就是相对于起点的位置
			var to = Math.max(0 ,Math.min(maxVolumeWidth ,move + circleInit));
			volumeCircle.style.left = to + 'px';
			nowVolume.style.width = volumeCircle.style.left;
			// 声音图标。如果此时是静音的话，就要换成静音图标
			audio.volume = to / maxVolumeWidth;
			if (audio.volume == 0) {
				volumeBtn.className = 'volume-off';
			} else {
				volumeBtn.className = 'volume-on';
			}

			window.getSelection() ? window.getSelection().removeAllRanges() : window.getSelection().empty();
		}
		document.onmouseup = function() {
			document.onmousemove = null;
		}
	};
	volumeLine.onclick = function(e) {
		// 和拖动调节音量差不多
		var eve = window.event || e;
		var mouseLeft = eve.clientX;
		var circleInit = volumeCircle.offsetLeft;
		var move = mouseLeft - volumeCircle.getBoundingClientRect().left;
		var to = Math.max(0 ,Math.min(maxVolumeWidth ,move + circleInit));

		volumeCircle.style.left = to + 'px';
		nowVolume.style.width = to + 'px';

		audio.volume = to / maxVolumeWidth;
		if (audio.volume == 0) {
			volumeBtn.className = 'volume-off';
		} else {
			volumeBtn.className = 'volume-on';
		}
	};
	/**
	 * 点击声音按钮后。
	 */
	volumeBtn.onclick = function() {
		if (isMuted == false) {
			audio.muted = true;
			volumeBtn.className = 'volume-off';
			// 记录下静音前 音量的大小
			volumeMark = volumeCircle.style.left;
			volumeCircle.style.left = 0 + 'px';
			nowVolume.style.width = volumeCircle.style.left;
			isMuted = true;
		} else {
			audio.muted = false;
			volumeBtn.className = 'volume-on';
			nowVolume.style.width = volumeCircle.style.left = volumeMark;
			isMuted = false;
		}
	};
	/**
	 * 转换时间，变成对应时间格式
	 * @param      {number}  time    The time
	 * @return     {string}  { description_of_the_return_value }
	 */
	function converseTime(time) {
		var minute = Math.floor((time / 60) % 60);
		var second = Math.floor(time % 60);	

		if (second < 10) {
			second = '0' + second;
		}
		return minute + ':' + second;
	}
	/**
	 * 让进度条那个圆发光
	 */
	function shineCircle() {
		// 如果播放，就发光。暂停，就停止发光
		if (play.style.display == "none") {
			musicProccessCircle.style.animation = 'shine 5s infinite';
		} else {
			musicProccessCircle.style.animation = '';
		}
	}
	// TODO: 当只有一张图片的时候，让图片转圈
	function rotatePic() {

	}
	/**
	 * 生成某个范围内的随机数。用于随机播放
	 * @param  {number}  min  最小值
	 * @param  {number}  max  最大值
	 * @return  {number}  返回一个随机数
	 */
	function randomNumber(min, max) {
		var range = max - min;
		var randomNum = Math.random() * (max - min);
		return Math.round(randomNum);
	}
	/**
	 * 随机播放
	 * @return  {number}  需要播放的歌曲序号
	 */
	function shufflePlay() {
		// 用来判断上一首歌和下一首歌是否相同
		var temp = position;
		while (temp == position) {
			position = randomNumber(0, musicList.length - 1);
		}
		return temp;
	}
	/**
	 * 播放时候显示的播放标志
	 */
	function appendPlaying() {
		var div = document.createElement('div');
		var span = [];
		var spanText = [];
		// span[0] = document.createElement('span');
		// div.appendChild(span[0]);
		// for (var i = 1; i < 5; i++) {
		// 	span[i] = document.createElement('span');
		// 	span[i].className = i + '';
		// 	div.insertBefore(span[i], span[i-1]);
		// }
		for (var i = 0; i < 5; i++) {
			span[i] = document.createElement('span');
			div.appendChild(span[i]);
		}
		div.setAttribute('id', 'playing-music');
		div.setAttribute('class', 'list-number');
		musicList[position].appendChild(div);
		// 让前面的歌曲序号消失，把标志放在歌曲序号的位置
		div.parentNode.getElementsByClassName('list-number')[0].style.display = 'none';
	}
	/**
	 * 移除播放标志
	 */
	function removePlaying() {
		var div = document.getElementById('playing-music');
		// 如果还木有播放的标志 ，那就直接返回。
		if (div == null) {
			return;
		}
		div.parentNode.getElementsByClassName('list-number')[0].style.display = 'block';
		div.parentNode.removeChild(div);
	}
	/**
	 * 添加图片
	 */
	function appendPic() {
		var img = [];
		// 当需要添加新的图片的时候，要重新开始
		picPosition = 0;
		for (var i = 0; i < song[position].photo.length; i++) {
			img[i] = document.createElement('img');
			img[i].src = song[position].photo[i];
			musicPic.appendChild(img[i]);
		}
		// 为了还没播放的时候，也有图片
		img[0].className = 'active';
	}
	/**
	 * 移除图片
	 */
	function removePic() {
		var img = musicPic.getElementsByTagName('img');
		while (img.length > 0) {
			musicPic.removeChild(img[0]);
		}
 	}
	/**
	 * 图片轮播
	 */
	function slidePic() {
		var img = musicPic.getElementsByTagName('img');
		// 如果只有一张图片，那就不要轮播了好吧
		if (img.length == 1) {
			return picTimesUp = null;
		}
		// 避免要先等两个5s才开始轮播。先执行一次
		slide();
		picTimesUp = setInterval(slide, 5000);
		// 如果是到了最后一张图片，就从第一张图片开始轮播
		// 如果是第一张图片，就要取消掉最后一张图片的类名
		function slide() {
			if (picPosition == img.length) {
				picPosition = 0;
			}	
			if (picPosition == 0) {
				img[0].className = 'active';
				img[img.length - 1].className = '';
			} else {
				img[picPosition].className = 'active';
				img[picPosition - 1].className = '';
			}
			picPosition++;
		}
	}
	/**
	 * 键盘快捷键
	 * @param  {object}  e  { parameter_description }
	 */
	function keyFunction(e) {
		var e = e || event;
		var keyCode = e.which;
		// 当按下ctrl + → 时，下一首
		if (e.ctrlKey && keyCode == 39) {
			next.onclick();
		}
		// 当按下ctrl + ←时，上一首
		if (e.ctrlKey && keyCode == 37) {
			pre.onclick();
		}

		// 当按下 ctrl + ↑，提高音量
		if ((keyCode == 38 && e.ctrlKey) || (keyCode == 40 && e.ctrlKey)) {
			var nowVolumeWidth = volumeCircle.offsetLeft;
			if (keyCode == 38) {
				nowVolumeWidth += 1/10 * maxVolumeWidth;
				// 如果加完后 大于声音的最大宽度 那就让它等于声音的最大宽度
				if (nowVolumeWidth > maxVolumeWidth) {
					nowVolumeWidth = maxVolumeWidth;
				}
			} else {
				nowVolumeWidth -= 1/10 * maxVolumeWidth;
				if (nowVolumeWidth < 0) {
					nowVolumeWidth = 0;
				}
			}
			volumeCircle.style.left = nowVolumeWidth + 'px';
			nowVolume.style.width = volumeCircle.style.left;
			// 如果当前音量为0 就要声音图标换成静音
			audio.volume = nowVolumeWidth / maxVolumeWidth;
			if (audio.volume == 0) {
				volumeBtn.className = 'volume-off';
			} else {
				volumeBtn.className = 'volume-on';
			}
		}
		// 当按下V时，静音或开启音量
		if (keyCode == 86) {
			volumeBtn.onclick();
		}
		// 当按下空格时，暂停 或继续播放
		// 这样写是为了避免 当输入的歌曲名含空格的时候 会暂停播放音乐
		if (keyCode == 32) {
			if (document.activeElement.id == 'search') {
				return;
			} else {
				if (isPauseClick == true) {
					play.onclick();
				} else {
					pause.onclick();
				}
			}
		}
		// 当按下 o 时候
		if (keyCode == 79) {
			musicLoop.onclick();
		}
		// 当按下enter的时候，搜索
		if (keyCode == 13) {
			searchBtn.onclick();
		}
	}
	// 当视口大小发生改变的时候
	window.onresize = function() {
		// 要调整进度条的最大宽度
		maxWidth = musicProccessLine.offsetWidth;
		// 歌词的高度
		judge = playerLrc.offsetHeight / 2;
		// 重新计算歌词框的中间位置的歌词序号
		for (var i = 0; i < pLrc.length; i++) {
			if (pLrc[i].offsetTop > judge) {
				limit = i;	
				break;
			}
		}
		// scrollPosition 也要跟着改变
		scrollPosition = lrcIndex - limit;
	}
	/**
	 * 获得那个刚才要播放的在线音乐，并且把它加载到列表上
	 * @return  {boolean}  木有内容
	 * @return  {object}  获得的歌曲信息
	 */
	function getSongInfoOnline() {
		var songInfo = JSON.parse(localStorage.getItem('songInfo'));
		// 如果木有搜索，就木有搜索内容了，返回
		if (songInfo == null) {
			return false;
		}
		online = true;
		var ul = document.createElement('ul');
		var li = [];
		var listSong = document.getElementsByClassName('list-song')[0];
		// 播放列表那里的序号
		var span = document.createElement('span');
		span.innerHTML = musicList.length + 1;
		span.className = 'list-number';
		ul.appendChild(span);
		for (var i = 0; i < 3; i++) {
			li[i] = document.createElement('li');
			ul.appendChild(li[i]);
		}
		// 播放列表那里的歌曲信息
		li[0].innerHTML = songInfo.song[0].songName;
		li[1].innerHTML = songInfo.song[0].singer;
		li[2].innerHTML = songInfo.song[0].time;
		listSong.appendChild(ul);
		return songInfo.song;
	}
	/**
	 *  跳转到搜索页面
	 */
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
}
addLoadEvent(getSongInfo.bind(this, 'songInfo.json'));