/**
 * version: 2.0
 *  1. 每次只对 livenode 周围的9个点(包含自身)进行检查
 *  2. 中止条件判断
 */
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
    text = null,
    dinput = null,
    jinput = null;
// {} => Map
const index2rect = new Map();

// 提示信息
const tips = ["Start", "Stop", "Reset", "Random", "Patterns", "Mouse"];

// 是否开启 click + hover
let openHoverWithClick = true;

// 是否重复检测
let whetherSetInterval;

// 下一轮需要更新的结点
// {i,j,k}, 位置+opacity
let nodesNeedsUpdating = new Array();
// 现在存活的结点
// 具体的结点(index2rext), 位置
let liveNode = new Set();

// 临时变量, 用于判断当前这个点是否做过检查
// {i*LENGTH+j}
let checkNodes = new Set();

// 内置的 Pattern
let patterns = null;
let nowPatterIndex = 0;
let patternLength = 0;

// links
const links = ["https://www.conwaylife.com/wiki/Category:Animated_images"];

// 执行函数
main();

// 主程序入口
function main() {
    help();
    initiation();
    constructBoard();
    constructBall();
}

// 友情链接
function help() {
    for (let i in links) {
        console.log(links[i]);
    }
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
        .attr("x", -50 - DELTA * 3)
        .style("font-family", "consolas")
        .attr("text-anchor", "left")
        .style("visibility", "hidden");
    if (WIDTH <= HEIGHT * 1.3) {
        text.attr("x", DELTA * 3);
    }
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
    // input
    jinput = $("#selectPattern");
    dinput = d3
        .select("#selectPattern")
        .style("top", Y1 + "px")
        .style("left", X1 + "px")
        .style("height", DELTA * 2 - 6 + "px")
        .style("width", "200px");
}

// 构造小球
function constructBall() {
    ball.attr("fill", "red")
        .attr("r", DELTA)
        .attr("cx", DELTA)
        .attr("cy", (d, i) => (i + 1) * 4 * DELTA)
        .on("mouseover", function (e, d) {
            let now = d3.select(this);
            // 使用 ()=>{} 的方法下一行报错
            let cx = Number(now.attr("cx"));
            let cy = Number(now.attr("cy"));
            // 获取宽度
            text.text(d)
                // .attr("x", -(cx + DELTA * 2))
                // .attr("x", -50 - (cx + DELTA * 2))
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
            } else if (d === "Patterns") {
                showPatterns();
            } else if (d === "Mouse") {
                mouseHoverToggle();
            }
        });
}

// 是否启用 click + hover 绘图
function mouseHoverToggle() {
    openHoverWithClick = !openHoverWithClick;
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
    let lastNode = { i: 0, j: 0, c: 0 };
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
        .on("click", (e, d) => {
            flip(index2rect.get(d.i + " " + d.j));
        })
        .on("mouseover", (e, d) => {
            if (!openHoverWithClick) {
                return;
            }
            if (e.which != 1) {
                // 处理停顿写字
                lastNode.c = 0;
                return;
            }
            // 中间的 rect 补色
            if (lastNode.c === 0) {
                flipAdd(index2rect.get(d.i + " " + d.j));
                lastNode.i = d.i;
                lastNode.j = d.j;
                lastNode.c = 1;
            } else {
                let td = lastNode;
                let ci = td.i < d.i ? 1 : -1,
                    cj = td.j < d.j ? 1 : -1;
                let li = (d.i - td.i) / ci,
                    lj = (d.j - td.j) / cj;
                const length = Math.max(li, lj);
                let di = (d.i - td.i) / length,
                    dj = (d.j - td.j) / length;
                for (let k = 0; k <= length; ++k) {
                    let i = Math.round(td.i + k * di);
                    let j = Math.round(td.j + k * dj);
                    flipAdd(index2rect.get(i + " " + j));
                }
                lastNode.i = d.i;
                lastNode.j = d.j;
            }
        });
    grid = chess.selectAll("rect");
}

function flipAdd(dom) {
    let opacity = Number(dom.style("opacity"));
    if (opacity === 0) {
        liveNode.add(dom);
        dom.style("opacity", 1);
    }
}

// flip
function flip(dom) {
    let opacity = Number(dom.style("opacity"));
    if (opacity === 1) {
        liveNode.delete(dom);
    } else {
        liveNode.add(dom);
    }
    dom.style("opacity", 1 - opacity);
}

// start
function start() {
    stop();
    whetherSetInterval = setInterval(() => {
        let d1 = new Date().getTime();
        mainLoop();
        update();
        let d2 = new Date().getTime();
        // console.log("Time:" + (d2 - d1));
    }, timeOut);
}

// 更新 opacity
function update() {
    if (nodesNeedsUpdating.length === 0) {
        stop();
        return;
    }
    let now;
    while ((now = nodesNeedsUpdating.pop()) != undefined) {
        let dom = index2rect.get(now.i + " " + now.j);
        let opacity = Number(now.k);
        if (opacity === 1) {
            liveNode.add(dom);
        } else {
            liveNode.delete(dom);
        }
        dom.style("opacity", now.k);
    }
}

// start random
function startRandom() {
    reset();
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
    liveNode.clear();
    grid.style("opacity", "0");
}

// main loop
function mainLoop() {
    checkNodes.clear();
    for (let item of liveNode) {
        let d = item.data()[0];
        let i = d.i,
            j = d.j;
        // 对周围的点进行排查
        checkNine(i, j);
    }
}

function checkNine(x, y) {
    let x1 = x - 1,
        x2 = x + 1,
        y1 = y - 1,
        y2 = y + 1;
    // 人口过少: 任何活细胞如果活邻居少于2个, 则死掉
    // 正常: 任何活细胞如果活邻居为2个或3个, 则继续活
    // 人口过多: 任何活细胞如果活邻居大于3个, 则死掉
    // 繁殖: 任何死细胞如果活邻居正好是3个, 则活过来
    for (let i = x1; i <= x2; ++i) {
        for (let j = y1; j <= y2; ++j) {
            if (!(i < SEG || i >= LENGTH || j < SEG || j >= LENGTH)) {
                if (checkNodes.has(i * LENGTH + j)) {
                    continue;
                }
                let num = checkEight(i, j);
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
                checkNodes.add(i * LENGTH + j);
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

// 展示内置的 pattern
function showPatterns() {
    if (patterns === null) {
        d3.json("data/pattern.min.json").then(function (DATA) {
            patterns = DATA.patterns;
            patternLength = Number(DATA.length);
            dinput
                .attr(
                    "placeholder",
                    "select built-in pattern" +
                        "(0-" +
                        (patternLength - 1) +
                        ")"
                )
                .on("keyup", (e) => {
                    // enter
                    if (e.keyCode != 13) {
                        return;
                    }
                    let val = Number(jinput.val());
                    if (!isNaN(val)) {
                        if (val < 0 || val >= patternLength) {
                            jinput.val("Out of Bound!");
                        } else {
                            reset();
                            nowPatterIndex = val;
                            showSelectedPattern();
                        }
                    }
                })
                .style("visibility", "visible");
            showPatterns();
        });
    } else {
        reset();
        patternChange();
        showSelectedPattern();
    }

    function showSelectedPattern() {
        let now = patterns[nowPatterIndex];
        for (let i in now) {
            flip(index2rect.get(now[i].i + " " + now[i].j));
        }
        jinput.val("Pattern " + nowPatterIndex);
    }

    function patternChange() {
        ++nowPatterIndex;
        if (nowPatterIndex >= patternLength) {
            nowPatterIndex = 0;
        }
    }
}

// 保存当前的活跃顶点(用于测试生成 Patterns)
function savePosition() {
    let data = [];
    for (let item of liveNode) {
        let d = item.data()[0];
        let i = d.i,
            j = d.j;
        data.push({ i, j });
    }
    let content = JSON.stringify({ data: data });
    console.log(content);
    // let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    // saveAs(blob, "save.json");
}
