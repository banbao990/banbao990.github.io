const RATE = 0.9;
const HEIGHT_ORIGIN = $(window).height();
const WIDTH_ORIGIN = $(window).width();
const HEIGHT = HEIGHT_ORIGIN * RATE;
const WIDTH = WIDTH_ORIGIN * RATE;
let svg;
let SEG = 2;
let DELTA = 10;
let timeOut = 50;

// 边界值
let X1, X2, Y1, Y2;
// 棋盘大小 [SEG, LENGTH)
let LENGTH;

// 球与棋盘
let ball = null,
    chess = null,
    grid = null,
    text = null;
// {} => Map
const index2rect = new Map();

// 提示信息
const tips = ["Start", "Stop", "Reset", "Random"];

// 是否重复检测
let whetherSetInterval;

// 下一轮需要更新的结点
let nodesNeedsUpdating = new Array();

// 执行函数
main();

// 主程序入口
function main() {
    initiation();
    constructBoard();
    constructBall();
}

// 初始化
function initiation() {
    // svg
    d3.select("#container")
        .style("width", WIDTH_ORIGIN + "px")
        .style("height", HEIGHT_ORIGIN + "px")
        .selectAll("*")
        .remove();
    svg = d3.select("#container").append("svg");
    // chess
    chess = svg.append("g").attr("id", "chess");
    // ball
    ball = svg.selectAll("circle").data(tips).enter().append("circle");
    // text
    text = svg
        .append("text")
        .text("XXX")
        .style("font-family", "consolas")
        .attr("text-anchor", "left")
        .style("visibility", "hidden");
    // else
    let t = Math.min(HEIGHT, WIDTH);
    t -= t % DELTA;
    X1 = (WIDTH_ORIGIN - t) / 2;
    X2 = X1 + t;
    Y1 = (HEIGHT_ORIGIN - t) / 2;
    Y2 = Y1 + t;
    LENGTH = (X2 - X1) / DELTA - SEG;
    svg.attr("height", t)
        .attr("width", t)
        .attr("id", "backSvg")
        .style("top", Y1 + "px")
        .style("left", X1 + "px");
}

// 构造小球
function constructBall() {
    ball.attr("fill", "red")
        .attr("r", DELTA)
        .attr("cx", DELTA)
        .attr("cy", (d, i) => (i + 1) * 3 * DELTA)
        .on("mouseover", function (e, d) {
            let now = d3.select(this);
            // 使用 ()=>{} 的方法下一行报错
            let cx = Number(now.attr("cx"));
            let cy = Number(now.attr("cy"));
            // 获取宽度
            let width = $("text")[0].getBoundingClientRect().width;
            text.text(d)
                // .attr("x", -(cx + DELTA * 2))
                .attr("x", -width - (cx + DELTA * 2))
                .attr("y", cy + DELTA / 2)
                .style("visibility", "visible");
        })
        .on("mouseout", () => {
            text.style("visibility", "hidden");
        })
        .on("click", (e, d) => {
            if (d === "Start") {
                start();
            } else if (d === "Stop") {
                stop();
            } else if (d === "Reset") {
                reset();
            } else if (d === "Random") {
                startRandom();
            }
        });
}

// 构造棋盘
function constructBoard() {
    let data = new Array();
    let c = 1;
    for (let i = SEG; i < LENGTH; ++i) {
        for (let j = SEG; j < LENGTH; ++j) {
            data.push({ i, j });
        }
    }
    chess
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("stroke-width", function (d) {
            // index2rect
            index2rect.set(d.i + " " + d.j, d3.select(this));
            return 0;
        })
        .attr("height", DELTA)
        .attr("width", DELTA)
        .attr("x", (d) => d.i * DELTA)
        .attr("y", (d) => d.j * DELTA)
        .attr("fill", "blue")
        .style("opacity", "0")
        .on("click", function () {
            flip(d3.select(this));
        });
    grid = chess.selectAll("rect");
}

// flip
function flip(dom) {
    dom.style("opacity", 1 - Number(dom.style("opacity")));
}

// start
function start() {
    stop();
    whetherSetInterval = setInterval(() => {
        let d1 = new Date().getTime();
        mainLoop();
        update();
        let d2 = new Date().getTime();
        // console.log("Time" + (d2 - d1));
    }, timeOut);
}

// 更新 opacity
function update() {
    let now;
    while ((now = nodesNeedsUpdating.pop()) != undefined) {
        index2rect.get(now.i + " " + now.j).style("opacity", now.k);
    }
}

// start random
function startRandom() {
    stop();
    whetherSetInterval = setInterval(() => {
        randomFlip();
    }, timeOut);
}

// stop
function stop() {
    clearInterval(whetherSetInterval);
}

// reset
function reset() {
    stop();
    grid.style("opacity", "0");
}

// main loop
function mainLoop() {
    // 人口过少: 任何活细胞如果活邻居少于2个, 则死掉
    // 正常: 任何活细胞如果活邻居为2个或3个, 则继续活
    // 人口过多: 任何活细胞如果活邻居大于3个, 则死掉
    // 繁殖: 任何死细胞如果活邻居正好是3个, 则活过来

    for (let i = SEG; i < LENGTH; ++i) {
        for (let j = SEG; j < LENGTH; ++j) {
            let num = checkEight(i, j);
            let now = index2rect.get(i + " " + j);
            opacity = Number(index2rect.get(i + " " + j).style("opacity"));
            if (opacity === 1) {
                if (num < 2 || num > 3) {
                    let k = 0;
                    nodesNeedsUpdating.push({ i, j, k });
                }
            } else {
                if (num === 3) {
                    let k = 1;
                    nodesNeedsUpdating.push({ i, j, k });
                }
            }
        }
    }
}

function checkEight(x, y) {
    let x1 = x - 1,
        x2 = x + 1,
        y1 = y - 1,
        y2 = y + 1;
    let ret = 0;
    for (let i = x1; i <= x2; ++i) {
        for (let j = y1; j <= y2; ++j) {
            if (i === x && j === y) {
                continue;
            }
            if (!(i < SEG || i >= LENGTH || j < SEG || j >= LENGTH)) {
                if (index2rect.get(i + " " + j).style("opacity") === "1") {
                    ++ret;
                }
            }
        }
    }
    return ret;
}

// 随机反转一个点
function randomFlip() {
    // [0, 1)
    let x = Math.floor(Math.random() * (LENGTH - SEG)) + SEG;
    let y = Math.floor(Math.random() * (LENGTH - SEG)) + SEG;
    flip(index2rect.get(x + " " + y));
}
