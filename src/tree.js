//配置选项
var option = {
    grid: {
        width: 800,
        height: 800,
        left:80,
        right:80,
        top:30,
        bottom:50,
        backgroundColor: '#000',
        backgroundOpacity: 0
    },
    color: {
        normal: ["#40b4de", "#7dcaee", "#75b545"],
        emphasis: ["#60d4fe", "#9DEAFE", "#85C555"]
    }
};

//画布大小
var width = option.grid.width;
var height = option.grid.height;
var diameter = 900;

//画布周边的空白
var padding = {
    left:option.grid.left,
    right:option.grid.right,
    top:option.grid.top,
    bottom:option.grid.bottom
};

//定义画布
var svg;
var tree, diagonal;

//定义尺度
var rScale1,
    rScale2;
var maxLevel1 = 26;
var maxLevel2 = 21;
var colorScale1,
    colorScale2;
var greyScale1,
    greyScale2,
    greyScale3,
    greyScale4;
var fontScale1,
    fontScale2;


//定义数据
var i = 0;
var level1 = [];
var level2 = [];
var root;
var rfix = [30, 25, 18, 13, 7, 3, 3, 3];
var rfixMin = [12, 9, 6, 4, 3, 3, 3, 3];

function setData(series) {
    root = series;
}

function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function setScaleByDepth(depth) {
    var rScale = d3.scale.linear()
        .domain([0, 100])
        .range([0, rfix[depth]]);

    return rScale;
}

function setScale() {
    rScale1 = d3.scale.linear()
        .domain([d3.min(level1), d3.max(level1)])
        .range([18, maxLevel1]);

    rScale2 = d3.scale.linear()
        .domain([d3.min(level2), d3.max(level2)])
        .range([15, maxLevel2]);

    colorScale1 = d3.scale.linear()
        .domain([d3.min(level1), d3.max(level1)])
        //.range(["#83c5ec", "#2094c0"])
        .range(["#0ec1ed", "#0eb1dd"]);
    colorScale2 = d3.scale.linear()
        .domain([d3.min(level2), d3.max(level2)])
        //.range(["#89cd9f", "#509020"])
        .range(["#72cf5a", "#6cb644"]);

    greyScale1 = d3.scale.linear()
        .domain([d3.min(level1), d3.max(level1)])
        .range(["#e8e8e8", "#ccc"]);

    greyScale2 = d3.scale.linear()
        .domain([d3.min(level2), d3.max(level2)])
        .range(["#e8e8e8", "#ccc"]);

    greyScale3 = d3.scale.linear()
        .domain([d3.min(level1), d3.max(level1)])
        .range(["#aaa", "#808080"]);

    greyScale4 = d3.scale.linear()
        .domain([d3.min(level2), d3.max(level2)])
        .range(["#999", "#7c7c7c"]);

    fontScale1  = d3.scale.linear()
        .domain([d3.min(level1), d3.max(level1)])
        .rangeRound([10, 20]);

    fontScale2  = d3.scale.linear()
        .domain([d3.min(level2), d3.max(level2)])
        .rangeRound([8, 16]);

}


function updateTree(source) {

    var rfixNormal = function(d) {
        return rfix[d.depth];
    };
    var rfixEmphasis = function(d) {
        return rfixNormal(d)+2;
    };

    var rNormal = function(d) {
        var rscale = setScaleByDepth(d.depth);
        return rscale(d.size*10);
    };
    var rEmphasis = function(d) {
        return rNormal(d)+2;
    };


    var colorfix = ["#efd42f", "#ebc02f", "#e38e2f", "#71badd", "#41a2db", "#ccc", "#ccc", "#ccc"];
    //var colorfix = ["#61a0a8", "#cd4870", "#4f708a", "#fd9c35", "#675bba", "#ccc", "#ccc", "#ccc"];

    var colorNormal = function(d) {
        var color = "#ccc";
            switch (d.type) {
              case "type1":
                  color = colorfix[0];
                  break;
              case "type2":
                  color = colorfix[1];
                  break;
              case "type3":
                  color = colorfix[2];
                  break;
              case "type4":
                  color = colorfix[3];
                  break;
              case "type5":
                  color = colorfix[4];
                  break;
              default:
                  break;
          }
        return color;
    };
    var colorEmphasis = function(d) {
        return d3.rgb(colorNormal(d)).brighter(0.2);
    };

    var fontfix = [20, 16, 14, 12, 10, 10, 8, 8];

    var fontNormal = function (d){
        return fontfix[d.depth] + "px";
    };
    var fontEmphasis = function (d){
        return (fontfix[d.depth]+2) + "px";
    };

    var fontColor = function (d){
        return "#808080";

    };
    var linkColor = function (d){
        return "#ddd";

    };
    var linkfix = [8, 5, 3, 2, 1, 1, 1, 1];
    var linkWidth = function (d){
        return linkfix[d.source.depth];
    };


    var textOffset = maxLevel2*2;
    var duration = 500;

    // Compute the new tree layout.
    var nodes = tree.nodes(root);

    // Normalize for fixed-depth.
    nodes.forEach(function(d, i) {
        d.y = d.depth * 100;
    });

    // Update the nodes…
    var node = svg.selectAll(".tree-node")
        .data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter()
        .append("g")
        .attr("class", "tree-node")
        .attr("transform", function(d) {
            return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
        })
        .on("click", function(d) {
            toggle(d);
            updateTree(d);
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .select("circle.outer-circle")
                .transition()
                .duration(200)
                .attr("r", rfixEmphasis)
                //.attr("opacity", 1)
                .attr("fill", colorEmphasis);

            d3.select(this)
                .select("circle.inner-circle")
                .transition()
                .duration(200)
                .attr("r", rEmphasis)
                //.attr("opacity", 1)
                .attr("fill", colorEmphasis);

            d3.select(this)
                .select(".tree-text")
                .transition()
                .duration(200)
                .attr("font-size", fontEmphasis);

        })
        .on("mouseout", function(d) {
            d3.select(this)
                .select("circle.outer-circle")
                .transition()
                .duration(100)
                .attr("r", rfixNormal)
                //.attr("opacity", 0.8)
                .attr("fill", colorNormal);

            d3.select(this)
                .select("circle.inner-circle")
                .transition()
                .duration(100)
                .attr("r", rNormal)
                //.attr("opacity", 1)
                .attr("fill", colorNormal);

            d3.select(this)
                .select(".tree-text")
                .transition()
                .duration(200)
                .attr("font-size", fontNormal);
        });

    nodeEnter.append("circle")
        .attr("class", "outer-circle")
        .attr("r", 1e-6)
        //.attr("fill", function(d) { return d._children ? "#aaa" : "#ccc"; })
        .attr("opacity", 0);

    nodeEnter.append("circle")
        .attr("class", "inner-circle")
        .attr("r", 1e-6)
        //.attr("fill", function(d) { return d._children ? "#aaa" : "#ccc"; })
        .attr("opacity", 0);


    nodeEnter.append("text")
        .attr("class", "tree-text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) {
            if (d.depth != 0) {
                return d.x < 180 ? "translate("+textOffset+")" : "rotate(180)translate(-"+textOffset+")";
            }
            else{
                return "rotate(-90)translate("+textOffset+")";
            }
        })
        .text(function(d) { return d.name; })
        .attr("opacity", 1e-6);



    // Transition nodes to their new position.
    var nodeUpdate = node
        .transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        });

    nodeUpdate.select("circle.outer-circle")
        .transition()
        .duration(300)
        .attr("fill", colorNormal)
        //.attr("stroke", colorNormal)
        //.attr("stroke-width", 2)
        .attr("r", rfixNormal)
        .attr("opacity", 0.2);

    nodeUpdate.select("circle.inner-circle")
        .transition()
        .duration(300)
        .attr("fill", colorNormal)
        .attr("r", rNormal)
        .attr("opacity", 1);

    nodeUpdate.select(".tree-text")
        .attr("text-anchor", function(d) {
            if (d.depth != 0) {
                return d.x < 180 ? "start" : "end";
            }
            else{
                return "start";
            }

        })
        .attr("transform", function(d) {
            if (d.depth != 0) {
                return d.x < 180 ? "translate("+textOffset+")" : "rotate(180)translate(-"+textOffset+")";
            }
            else{
                return "rotate(-90)translate("+textOffset+")";
            }
        })
        .attr("fill", fontColor
        //function(d) {
        //    //return colorEmphasis(d);
        //    return "#909090";
        //}
    )
        .attr("opacity", 1)
        .attr("font-size", fontNormal);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit()
        .transition()
        .duration(duration)
        .attr("transform", function(d) { return "rotate(" + (source.x - 90) + ")translate(" + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select(".tree-text")
        .attr("opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll(".tree-link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter()
        .insert("svg:path", "g")
        .attr("class", "tree-link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        })
        .attr("opacity", 0)
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal)
        .attr("fill", "none")
        //.attr("stroke", "#ddd")
        .attr("stroke", function(d, i) {
            return colorNormal(d.source);
        })
        .attr("stroke-width", linkWidth)
        .attr("opacity", 0.5);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function initChart(chartId) {
    tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var nodes = tree.nodes(root);

    //数据分层
    function splitLevel(node) {
        if (node.size && (node.depth === 1)) {
            level1.push(node.size);
        }

        if (node.size && (node.depth === 2)) {
            level2.push(node.size);
        }
    }

    nodes.forEach(splitLevel);

    diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });


    svg = d3.select(chartId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (padding.left + diameter / 2) + "," + diameter / 2 + ")");

    // Toggle children.
    root.x0 = 0;
    root.y0 = 0;

    //function toggleAll(d) {
    //    if (d.children) {
    //        d.children.forEach(toggleAll);
    //        toggle(d);
    //    }
    //}
    //
    //// Initialize the display to show a few nodes.
    //root.children.forEach(toggleAll);

}

function destroyChart() {
}


function toggleAll(node) {
    if (node.children) {
        node.children.forEach(toggleAll);
        toggle(node);
    }
}

function renderChart() {
    setScale();
    updateTree(root);

}

function mockdata() {
    var data = {
        name:"大数据应用开发能力",type: "type0",
        children:[
            {name:"业务开发", type: "type1",children:[
                {name:"后端开发", type: "type1", children:[], size:8},
                {name:"前端开发", type: "type1", children:[], size:3},
                {name:"可视化开发", type: "type1", children:[], size:3},
                {name:"资料开发", type: "type1", children:[], size:5}
            ], size:5},
            {name:"数据挖掘", type: "type2",children:[
                {name:"算法建模", type: "type2", children:[
                    {name:"用户画像", type: "type2",children:[], size:2},
                    {name:"精准推荐", type: "type2",children:[], size:2},
                    {name:"预测分析", type: "type2",children:[], size:1},
                    {name:"关系网络", type: "type2",children:[], size:4},
                    {name:"文本分析", type: "type2",children:[], size:5},
                    {name:"评分模型", type: "type2",children:[], size:2},
                    {name:"地理位置分析", type: "type2",children:[], size:2},
                    {name:"时间序列分析", type: "type2",children:[], size:4}
                ], size:8},
                {name:"业务模型", type: "type2",children:[
                    {name:"公安", type: "type2",children:[], size:3},
                    {name:"政务", type: "type2",children:[], size:5},
                    {name:"金融", type: "type2",children:[], size:2},
                    {name:"交通", type: "type2",children:[], size:6},
                    {name:"其他", type: "type2",children:[], size:3}
                ], size:5}
            ], size:8},
            {name:"总体架构", type: "type3",children:[
                {name:"需求分析", type: "type3",children:[
                    {name:"商业理解，需求沟通", type: "type3",children:[], size:6},
                    {name:"需求转化，业务经验", type: "type3",children:[], size:4},
                    {name:"产品定义，项目交付", type: "type3",children:[], size:3}
                ], size:6},
                {name:"架构设计", type: "type3",children:[
                    {name:"数据理解", type: "type3",children:[], size:7},
                    {name:"解决方案", type: "type3",children:[], size:5},
                    {name:"技术架构设计", type: "type3",children:[], size:8}
                ], size:6}
            ], size:9},
            {name:"基础能力", type: "type4",children:[
                {name:"数仓开发", type: "type4",children:[
                    {name:"ETL", type: "type4",children:[], size:4},
                    {name:"数据建模", type: "type4",children:[], size:5}
                ], size:4},
                {name:"数据开发", type: "type4",children:[
                    {name:"数据采集", type: "type4",children:[], size:8},
                    {name:"ID-mapping(身份识别)", type: "type4",children:[], size:7},
                    {name:"标签体系", type: "type4",children:[], size:4},
                    {name:"特征工程", type: "type4",children:[], size:6}
                ], size:6},
                {name:"算法基础", type: "type4",children:[
                    {name:"逻辑回归", type: "type4",children:[], size:5},
                    {name:"随机森林", type: "type4",children:[], size:6},
                    {name:"决策树", type: "type4",children:[], size:4},
                    {name:"其他算法", type: "type4",children:[], size:3}
                ], size:6}
            ], size:9},
            {name:"应用场景", type: "type5",children:[
                {name:"专有云", type: "type5",children:[], size:3},
                {name:"一体机", type: "type5",children:[], size:6},
                {name:"公有云", type: "type5",children:[], size:8}
            ], size:4}
        ],
        size:0
    };

    return data;
}

setData(mockdata());
initChart("#treechart");
renderChart();

