var singer = 'wuyuetian';
function getImg() {
	var imgContainer = document.getElementById('img-container');
	// 图片张数
	var picNumber = 9;
	// 用来记录图片的编号的
	var j = 1;
	// 记录每一列
	var columnHeight = document.getElementsByClassName('list');
	// 记录高度最小的列
	var whichColumn = minColumnHeight(columnHeight);
	console.log('columnHeight: ' + columnHeight[0].offsetHeight);
	console.log('columenLenth:' + columnHeight.length);
	// 初始化。如果木有滚动条的话，就添加一堆图片让他出现滚动条
	// columnHeight[whichColumn].clientHeight
	while (columnHeight[whichColumn].offsetHeight < window.innerHeight) {
		var whichColumn = minColumnHeight(columnHeight);
		appendImg(whichColumn);
		console.log('win: ' + window.innerHeight);
		console.log('offsetHeight:' + columnHeight[whichColumn].offsetHeight);
		setTimeout(function() {
			whichColumn = minColumnHeight(columnHeight);
		}, 1000);
		
		console.log('whichColumn: ' + whichColumn);
	}
	// 当滚动条滚动的时候
	window.onscroll = function() {
		// 求出滚动条距离底部的距离
		var scrollBottom = document.documentElement.scrollHeight - document.documentElement.clientHeight - document.body.scrollTop;
		// 当距离底部还有50px的时候，会添加图片
		if (scrollBottom <= 100) {
			var whichColumn = minColumnHeight(columnHeight);
			appendImg(whichColumn);
		}
	}
	// 动态添加图片
	function appendImg(whichColumn) {
		var newImg = document.createElement('img');
		// 图片地址。名字的话，看情况改吧。。
		newImg.src = 'img/' + singer + getImgIndex(j, picNumber) + '.jpg';
		newImg.className = 'image';		
		var newLi = document.createElement('li');
		newLi.appendChild(newImg);
		columnHeight[whichColumn].appendChild(newLi);
		j++;
		var whichColumn = minColumnHeight(columnHeight);
	}
}
// 用来求出高度最小的列
function minColumnHeight(columnHeight) {
	var min = columnHeight[0].offsetHeight;
	var mark = 0;
	for (var i = 1; i < columnHeight.length; i++) {
		if (min > columnHeight[i].offsetHeight) {
			min = columnHeight[i].offsetHeight;
			mark = i;
		}
	}
	return mark;
}
function maxColumnHeight(columnHeight) {
	var max = columnHeight[0].offsetHeight;
	var mark = 0;
	for (var i = 1; i < columnHeight.length; i++) {
		if (max < columnHeight[i].offsetHeight) {
			max = columnHeight[i].offsetHeight;
			mark = i;
		}
	}
	return mark;
}
// 循环利用图片。。。
function getImgIndex(j, column) {
	var imgIndex = j % column;
	if (imgIndex == 0) {
		imgIndex = column;
	}
	return imgIndex;
}

addLoadEvent(getImg);