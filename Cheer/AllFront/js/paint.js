
window.onload = function () {
    var oC = document.getElementById('c1');
    var oCG = oC.getContext('2d');
    oC.onmousedown = function (ev) {
        var ev = ev || window.event;
        oCG.beginPath();
        /*随机生成一种颜色*/
        let r1 = Math.floor(Math.random() * 255);
        let r2 = Math.floor(Math.random() * 255);
        let r3 = Math.floor(Math.random() * 255);
        oCG.strokeStyle = "rgb(" + r1 + "," + r2 + "," + r3 + ")";
        oCG.moveTo(ev.clientX - oC.offsetLeft, ev.clientY - oC.offsetTop);
        document.onmousemove = function (ev) {
            var ev = ev || window.event;//获取event对象
            oCG.lineTo(ev.clientX - oC.offsetLeft, ev.clientY - oC.offsetTop);
            oCG.stroke();
        };
        oC.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
};

$(window).resize(function () {
    //窗口大小变化时清空
    c1.width = document.documentElement.clientWidth;
    c1.height = document.documentElement.clientHeight;
});