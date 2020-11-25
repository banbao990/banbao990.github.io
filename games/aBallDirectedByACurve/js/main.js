const RATE = 0.9;
const HEIGHT_ORIGIN = $(window).height();
const WIDTH_ORIGIN = $(window).width();
const HEIGHT = HEIGHT_ORIGIN * RATE;
const WIDTH = WIDTH_ORIGIN * RATE;
let svg;
let SEG = 1;
let DELTA = 10;
let timeOut = 50;
// 边界值
let X1, X2, Y1, Y2;
// 记录轨迹
let track = new Array();
// 球与棋盘
let ball = null,
    chess = null,
    grid = null;

// {} => Map
const index2rect = new Map();

// 关闭自动连线
let closePaintContinuously = false;

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
    ball = svg.append("circle").attr("id", "ball");
    // else
    let t = Math.min(HEIGHT, WIDTH);
    t -= t % DELTA;
    X1 = (WIDTH_ORIGIN - t) / 2;
    X2 = X1 + t;
    Y1 = (HEIGHT_ORIGIN - t) / 2;
    Y2 = Y1 + t;
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
        .attr("cy", DELTA)
        .on("click", function () {
            let d = track.shift(); // 取出第一个元素的值并删除
            if (d === undefined) {
                return;
            }
            ball.transition(2000)
                .ease(d3.easeLinear)
                .attr("r", DELTA / 2)
                .attr("cx", (d.i + 0.5) * DELTA)
                .attr("cy", (d.j + 0.5) * DELTA);
            setTimeout(() => {
                moveWithTrack();
            }, 1000);
        });

    function moveWithTrack() {
        let d = track.shift();
        if (d === undefined) {
            setTimeout(() => {
                grid.transition(1000).ease(d3.easeLinear).style("opacity", "0");
                ball.transition(1000)
                    .ease(d3.easeLinear)
                    .attr("r", DELTA)
                    .attr("cx", DELTA)
                    .attr("cy", DELTA);
            }, 1000);
        } else {
            ball.transition(timeOut)
                .ease(d3.easeLinear)
                .attr("cx", (d.i + 0.5) * DELTA)
                .attr("cy", (d.j + 0.5) * DELTA);
            setTimeout(() => moveWithTrack(), timeOut * 2);
        }
    }
}

// 构造棋盘
function constructBoard() {
    let data = new Array();
    const length = (X2 - X1) / DELTA - SEG;
    let c = 1;
    for (let i = SEG; i < length; ++i) {
        for (let j = SEG; j < length; ++j) {
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
        .on("mouseover", function (e, d) {
            if (e.which != 1) {
                // 处理停顿写字
                if (track.length != 0) {
                    track[track.length - 1].c = 0;
                }
                return;
            }
            // 中间的 rect 补色
            if (
                // 不进行补色
                closePaintContinuously ||
                track.length === 0 ||
                track[track.length - 1].c === 0
            ) {
                d3.select(this).style("opacity", "1");
                let i = d.i,
                    j = d.j,
                    c = 1;
                track.push({ i, j, c });
            } else {
                let td = track[track.length - 1];
                let ci = td.i < d.i ? 1 : -1,
                    cj = td.j < d.j ? 1 : -1;
                let c = 1;
                let li = (d.i - td.i) / ci,
                    lj = (d.j - td.j) / cj;
                const length = Math.max(li, lj);
                let di = (d.i - td.i) / length,
                    dj = (d.j - td.j) / length;
                for (let k = 0; k <= length; ++k) {
                    let i = Math.round(td.i + k * di);
                    let j = Math.round(td.j + k * dj);
                    index2rect.get(i + " " + j).style("opacity", "1");
                    track.push({ i, j, c });
                }
            }
        });
    grid = chess.selectAll("rect");
}
