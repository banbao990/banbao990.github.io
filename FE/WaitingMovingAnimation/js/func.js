"use strict";

/* store the index.csv(link) */
let waitingImageToShow = [];
let movingImageToShow = [];
let movingDirectionToChoose = [
    "原地/Wait",
    "左/left",
    "右/right",
    "上/up",
    "下/down",
];

/* barrier to initVariable */
let ready = false;

/* moving derection */
let movingDirection = 0;

/* images dir */
const WAITING_IMAGE_DIR = "images/waiting/";
const MOVING_IMAGE_DIR = "images/moving/";

/* first image in 'moving' DIR is 02.png */
const MOVING_IMAGE_BASE = 2;

/* read index.csv */
function initVariables() {
    d3.csv("images/waiting/index.csv", function (csvdata) {
        waitingImageToShow.push(csvdata);
    });
    d3.csv("images/moving/index.csv", function (csvdata) {
        movingImageToShow.push(csvdata);
    });
    $("#tip").html("Will show tips here!");
    ready = true;
}

/* Show tips(waiting pic) */
function showTips() {
    if (!ready) {
        initVariables();
    }
    let str = $("#chooseImage").val();
    let strPut = "";
    if (isNaN(Number(str))) {
        /* not a number */
        return;
    }
    let start = parseInt(str);
    /* keyevent */
    switch (event.keyCode) {
        case 13:
            /* 13:enter */
            if (str.length === 2) {
                /* update background-image */
                changeImage(start);
            }
        default:
            break;
    }
    switch (str.length) {
        case 1:
            /* show at most 10 tips */
            start *= 10;
            let end = start + 10;
            let cnt = 0;
            for (let i = start; i < waitingImageToShow.length && i < end; ++i) {
                /* format */
                strPut +=
                    (start === 0 ? "0" : "") +
                    i +
                    "(" +
                    waitingImageToShow[i].description +
                    "), ";
                ++cnt;
                if (cnt === 3 || cnt === 6 || cnt === 10) {
                    strPut += "<br/>";
                }
            }
            break;
        case 2:
            /* show exact info */
            if (start < waitingImageToShow.length) {
                /* check bounds */
                strPut =
                    (start < 10 ? "0" : "") +
                    start +
                    "(" +
                    waitingImageToShow[start].description +
                    ")";
            }
            break;
        default:
            break;
    }

    $("#tip").html(strPut);
}

/* Show tips(moving pic) */
function showTips2() {
    if (!ready) {
        initVariables();
    }
    let str = $("#chooseImage2").val();
    let strPut = "";
    if (isNaN(Number(str))) {
        /* not a number */
        return;
    }
    let start = parseInt(str);
    /* keyevent */
    switch (event.keyCode) {
        case 13:
            /* 13:enter */
            if (str.length === 2) {
                /* update background-image */
                changeImage2(start);
            }
        default:
            break;
    }
    switch (str.length) {
        case 1:
            /* show at most 10 tips */
            start *= 10;
            let end = start + 10;
            let cnt = 0;
            for (let i = start; i < movingImageToShow.length && i < end; ++i) {
                /* first image in 'moving' DIR is 02.png */
                if (i < MOVING_IMAGE_BASE) {
                    i = MOVING_IMAGE_BASE;
                }
                /* format */
                strPut +=
                    (start === 0 ? "0" : "") +
                    i +
                    "(" +
                    movingImageToShow[i - MOVING_IMAGE_BASE].description +
                    ") ,";
                ++cnt;
                if (cnt === 3 || cnt === 6 || cnt === 10) {
                    strPut += "<br/>";
                }
            }
            break;
        case 2:
            /* show exact info */
            if (
                start >= MOVING_IMAGE_BASE &&
                start < movingImageToShow.length + MOVING_IMAGE_BASE
            ) {
                /* check bounds */
                strPut =
                    (start < 10 ? "0" : "") +
                    start +
                    "(" +
                    movingImageToShow[start - MOVING_IMAGE_BASE].description +
                    ")";
            }
            break;
        default:
            break;
    }

    $("#tip").html(strPut);
}

/* change background-images(moving) */
function changeImage2(index) {
    /* check bounds */
    if (
        index < MOVING_IMAGE_BASE ||
        index >= movingImageToShow.length + MOVING_IMAGE_BASE
    ) {
        return;
    }
    $("#moving").css(
        "background-image",
        "url(" +
            MOVING_IMAGE_DIR +
            movingImageToShow[index - MOVING_IMAGE_BASE].fileName +
            ")"
    );
}

/* change background-images(waiting) */
function changeImage(index) {
    /* check bounds */
    if (index <= 0 || index >= waitingImageToShow.length) {
        return;
    }
    $("#waiting").css(
        "background-image",
        "url(" + WAITING_IMAGE_DIR + waitingImageToShow[index].fileName + ")"
    );
    /* change the bg-images detail */
    let height = waitingImageToShow[index].height;
    let width = waitingImageToShow[index].width;
    /* may be float? */
    if (Math.abs(height / width - 3) < 1e-6) {
        $("#waiting").css("animation-name", "run");
        $("#waiting").height("var(--default-size)");
        $("#waiting").css("top", "25%");
    } else {
        $("#waiting").css("animation-name", "runHigher");
        $("#waiting").height("calc(2 * var(--default-size))");
        $("#waiting").css("top", "0");
    }
}

/* choose moving direction */
function ChooseDirection() {
    if (!ready) {
        initVariables();
    }
    let str = $("#chooseDirection").val();
    let index = Number(str);
    if (isNaN(index)) {
        /* not a number */
        return;
    }
    /* keyevent */
    switch (event.keyCode) {
        case 13:
            /* 13:enter */
            if (str.length === 2) {
                /* update bdirection */
                changeDirection(index);
            }
            /* return */
            return;
        default:
            break;
    }
    let strPut = "";
    switch (str.length) {
        case 1:
            if (index === 0) {
                strPut =
                    "00(原地/Wait)<br /> 01(左/left), 02(右/right)<br />03(上/up), 04(下/down)";
            }
            break;
        case 2:
            if (index >= 0 && index < movingDirectionToChoose.length) {
                strPut =
                    "0" + index + "(" + movingDirectionToChoose[index] + ")";
            }
            break;
        default:
            break;
    }
    $("#tip").html(strPut);
}

/* change direction(won't check bounds) */
function changeDirection(index) {
    movingDirection = index;
    let str = "";
    /* 00(Wait), 01(left), 02(right), 03(up), 04(down) */
    switch (index) {
        case 0:
            str = "movingHere";
            break;
        case 1:
        /* fall through */
        case 2:
            str = "movingLeft";
            break;
        case 3:
            str = "movingUp";
            break;
        case 4:
            str = "movingDown";
            break;
        default:
            break;
    }
    if (str.length === 0) {
        return;
    }
    $("#moving").css("animation-name", str);
    /* moving right */
    if (index === 2) {
        $("#moving").css("transform", "rotateY(180deg)");
    } else {
        $("#moving").css("transform", "rotateY(0)");
    }
}

/* change velocity */
function setConfidence(obj) {
    let a = Number(obj.value);
    document.getElementById("velocityDisplay").innerText = " " + a.toFixed(1);
    $("#waiting").css(
        "animation-duration",
        "calc(" + a + "*var(--animation-interval))"
    );
    $("#moving").css(
        "animation-duration",
        "calc(" + a + "*var(--animation-interval))"
    );
}
