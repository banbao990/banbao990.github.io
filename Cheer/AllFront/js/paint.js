
window.onload = function () {
    var oC = document.getElementById('c1');
    var oCG = oC.getContext('2d');
    oC.onmousedown = function (ev) {
        var ev = ev || window.event;
        oCG.beginPath();
        /*�������һ����ɫ*/
        let r1 = Math.floor(Math.random() * 255);
        let r2 = Math.floor(Math.random() * 255);
        let r3 = Math.floor(Math.random() * 255);
        oCG.strokeStyle = "rgb(" + r1 + "," + r2 + "," + r3 + ")";
        oCG.moveTo(ev.clientX - oC.offsetLeft, ev.clientY - oC.offsetTop);
        document.onmousemove = function (ev) {
            var ev = ev || window.event;//��ȡevent����
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
    //���ڴ�С�仯ʱ���
    c1.width = document.documentElement.clientWidth;
    c1.height = document.documentElement.clientHeight;
});