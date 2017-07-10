var remainTime = document.getElementById("remainTime");
setInterval(countTime ,1000);
setTimeout(
	function() {
		location.href = "index.html";
	} ,
	5000
);
var time = 5;
function countTime() {
	time--;
	remainTime.innerHTML = time;
}