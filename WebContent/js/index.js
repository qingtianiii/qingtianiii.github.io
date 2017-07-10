

function slidePic() {
	var img = document.getElementById('new-song').getElementsByTagName('img');
	var picPosition = 0;
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

addLoadEvent(slidePic);