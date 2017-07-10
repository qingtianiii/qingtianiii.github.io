/*正则表达式*/

function isUser(username) {
	var patt = /^\w{6,}$/;
	if(username.match(patt) == null) {
		return false;
	}
}
function isPsd(psd) {
	var patt = /^\w{6,20}$/;
	if(psd.match(patt) == null) {
		return false;
	}
}
function isMobile(mobile) {
	var patt = /^1[358][0-9]{9}$/;
	if(mobile.match(patt) == null) {
		return false;
	}
}
function isEmail(email) {

	var patt = /^\w+@(qq|\w+)\.com$/;
	if(email.match(patt) == null) {
		return false;
	}
}