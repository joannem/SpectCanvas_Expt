$('.instructions').css('display', "none");
$('.instructions-1').css('display', "block");

$('.instructions-pagination').click(function (evt) {
	evt.stopPropagation();
	$('.instructions-pagination').removeClass("active");
	$(this).addClass("active");

	var page = $(this)[0].id.substr(5);
	$('.instructions').css('display', "none");
	$('.instructions-' + page).css('display', "block");

});