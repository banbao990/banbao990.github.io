// JavaScript source code
//导航栏
//点击cheer,nav进来
$(".cheer").on("click", function () {
    let boxWidth = parseInt($(".nav").css("width"));
    let nowLeft = parseInt($(".nav").css("left"));
    //console.log(boxWidth + " " + nowLeft);
    if (nowLeft != 0) {
        $(".nav").animate({ left: 0 }, function () { $(".cheer").css("color", "white"); });
    }
    else {
        $(".nav").animate({ left: -boxWidth }, function () { $(".cheer").css("color", "black"); });
    }
})