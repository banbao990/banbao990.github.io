// 注意 strs 的长度需要为奇数
const strs = ["Welcome to", "banbao(990)'s", "world"];
const container = d3.select("#container");
const tbody = d3.select("body");
const lyrics = Array();
const songs = ["nianlunshuo.txt", "xingzi.txt"];
const CIRCLES = songs.length;
let zhFontLoaded = false;

for (let i = 0; i < CIRCLES; ++i) {
    lyrics.push("");
}

function readLyrics(i, songName) {
    return d3.text("utils/baseUtils/" + songName).then(function (data) {
        let temp = data.replace(/\n/g, " ").replace(/\s+/g, " ");
        lyrics[i] = temp;
        if (i + 1 === CIRCLES) {
            init();
        } else {
            readLyrics(i + 1, songs[i + 1]);
        }
    });
}

function main() {
    readLyrics(0, songs[0]);
}

function init() {
    tbody.style("visibility", "hidden");
    paintAll();
    d3.select(window).on("resize", paintAll);
    loadFonts();
}

// 等待字体加载完成之后再显示, 防止字体突然变化
async function loadFonts() {
    const font1 = new FontFace(
        "WildySign",
        'url("/utils/css/fonts/Wildy Sign-Personal Use.otf")'
    );
    await font1.load();
    document.fonts.add(font1);
    tbody.style("visibility", "visible");
    // 加载中文字体
    const font2 = new FontFace(
        "YanShiXiaXingKai",
        'url("/utils/css/fonts/zh/YanShiXiaXingKai-2.ttf")'
    );
    await font2.load();
    document.fonts.add(font2);
    // 一个动画转场
    $("body").animate({ opacity: 0 }, 1000, function () {
        d3.selectAll(".rotation").style("font-family", "YanShiXiaXingKai");
        setTimeout(() => $("body").animate({ opacity: 1 }, 1000), 1000);
    });
    zhFontLoaded = true;
}

function paintAll() {
    container.selectAll("*").remove();
    d3.selectAll(".rotation").remove();
    const width = $(window).width();
    const height = $(window).height();
    const size = Math.min(width * 0.7, height / 1.414);
    const svg = container.append("svg");
    const fontSize = size / 18;
    const smallFontSize = size / 40;
    const strNumRate = 1.08;
    // d3.select("#container").style("background-color", "#ffd1d1");

    // 设置 container 大小
    const cleft = (width - size) / 2;
    const ctop = (height - size) / 2;
    const shift = (strs.length - 1) / 2;
    const tspanInterval = 1.4;
    container
        .style("height", size + "px")
        .style("width", size + "px")
        .style("left", cleft + "px")
        .style("top", ctop + "px");
    svg.attr("height", size)
        .attr("width", size)
        .append("text")
        .classed("title", true)
        .text("")
        .attr("text-anchor", "middle")
        .attr("x", size / 2)
        .style("font-size", fontSize + "px")
        .selectAll("tspan")
        .data(strs)
        .enter()
        .append("tspan")
        .attr("x", size / 2)
        .attr("y", (d, i) => size / 2 + fontSize * tspanInterval * (i - shift))
        .text((d) => d);
    // 加上旋转的字体
    for (let i = 0; i < CIRCLES; ++i) {
        let r = (size / 2) * (0.5 + (0.4 * (i + 1)) / CIRCLES);
        let div = tbody
            .append("div")
            .attr("class", "rotation")
            .style("left", cleft + "px")
            .style("top", ctop + "px")
            .style("height", size + "px")
            .style("width", size + "px");

        const rotation = div
            .append("svg")
            .attr("height", size)
            .attr("width", size)
            .style("font-size", smallFontSize + "px");
        // 如果已经加载好了中文字体, 直接设置即可
        if (zhFontLoaded) {
            rotation.style("font-family", "YanShiXiaXingKai");
        }
        rotation
            .append("path")
            .attr("id", "path" + i)
            .attr(
                "d",
                `M ${size / 2 - r}, ${size / 2} 
                 a ${r},${r} 0 1,0 ${2 * r},0 
                 a ${r},${r} 0 1,0 ${-2 * r},0`
            )
            // .attr("stroke", "red")
            .attr("fill", "transparent");
        // 填充文字(计算文字长度)
        const num = Math.floor(
            (strNumRate * (Math.PI * r * 2)) / smallFontSize
        );
        let tempLyrics = lyrics[i];
        tempLyrics = tempLyrics.substr(0, num);
        rotation
            .append("text")
            .append("textPath")
            .text(tempLyrics)
            .attr("xlink:href", "#path" + i);
        // 旋转效果
        const animationDescription =
            ((i & 1) === 1 ? "clockwise" : "counterClockwise") +
            " 25s linear infinite";
        div.style("animation", animationDescription);
    }
}

main();
