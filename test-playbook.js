$(document).ready(function() {
    create();
});

function create() {
    console.log("ready");

    let playbookData = {
        "header" : {
            "ruleName" : "Rule_03",
            "eventname" : "eventname_01",
            "severity" : "medium"
        },
        "nodes" : [
            {
                "id": "node1",
                "name" : "node1",
                "field" : "sourceIp",
                "value" : "10.10.10.10",
                "method" : "같음",
                "nodeSide" : true,
                "parentNodeId" : "",
                "positionOrder": 1,
                "positionRow": 1,
                "hasChild" : true,
                "isFinish" : false
            },
            {
                "id": "node2",
                "name" : "node2",
                "field" : "sourceIp",
                "value" : "10.10.10.10",
                "method" : "같음",
                "result": "오탐",
                "nodeSide" : true,
                "parentNodeId" : "node1",
                "positionOrder": 2,
                "positionRow": 2,
                "hasChild" : false,
                "isFinish" : true
            },
            {
                "id": "node3",
                "name" : "node3",
                "field" : "sourceIp",
                "value" : "10.10.10.10",
                "method" : "같음",
                "nodeSide" : false,
                "parentNodeId" : "node1",
                "positionOrder": 3,
                "positionRow": 2,
                "hasChild" : true,
                "isFinish" : false
            },
            {
                "id": "node4",
                "name" : "node4",
                "field" : "sourceIp",
                "value" : "10.10.10.10",
                "method" : "같음",
                "result": "오탐",
                "nodeSide" : true,
                "parentNodeId" : "node3",
                "positionOrder": 4,
                "positionRow": 3,
                "hasChild" : false,
                "isFinish" : true
            },
            {
                "id": "node5",
                "name" : "node5",
                "field" : "sourceIp",
                "value" : "10.10.10.10",
                "method" : "같음",
                "result": "정탐",
                "nodeSide" : false,
                "parentNodeId" : "node3",
                "positionOrder": 4,
                "positionRow": 3,
                "hasChild" : false,
                "isFinish" : true
            }
        ]
    };
    createNodes('#playbook', playbookData);
}

function createNodes(parentElement, nodeData) {
    let svg = d3.select(parentElement)
        .append("svg")
        .attr("width", 1100)
        .attr("height", 800)
        .attr('viewBox', '0 0 1500 1500')
        .attr("style", "background-color: #1F1F1F; padding: 10px 10px 10px 10px;");
        
    let headerNodeData = nodeData.header;
    let childrenNodeData = nodeData.nodes;
    let childrenNodeDataMaximumRow = Math.max(...childrenNodeData.map(e => e.positionRow));
    let finishedNodes = [];
    let linePositions = [];

    // Default configurations
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        center = {x : +svg.attr('width') / 2, y: +svg.attr('height') / 2},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;
    let nodeSize = {width: 200, height: 100, lineGap: 20};
    let position = {x: center.x - 100, y: center.y - 300, yGap: 150};
    let blueColor = "#304d8d";
    let greenColor = "#9bcf53";
    let grayColor = "#1F1F1F";

    // Find grand children and finished nodes
    childrenNodeData.forEach(e => {
        // Find grand children
        let hasGrandChild = false;
        if (e.hasChild) {
            let children = childrenNodeData.filter(d => d.parentNodeId === e.id);
            children.forEach(c => {
                hasGrandChild = c.hasChild ? true : false;
            });
        }
        e.hasGrandChild = hasGrandChild;
        
        // Find finished noes
        if (e.isFinish) {
            finishedNodes.push(e);
        }
    });

    // Calculate node positions (x, y)
    childrenNodeData.forEach(e => {
        let row = e.positionRow;
        let positionX = 0;
        let positionY = 0;
        let linePosition = { fromX: 0, toX: 0, fromY: 0, toY: 0 }

        // Fixed first node position
        if (e.positionOrder === 1) {
            positionX = position.x;
            positionY = position.y + position.yGap - 30;
        } else { 
            let parentNodeData = childrenNodeData.filter(d => d.id === e.parentNodeId)[0];
            if (e.hasChild) {
                positionX = e.nodeSide ? center.x - 300 - (childrenNodeDataMaximumRow * 100) : center.x + 100 + (childrenNodeDataMaximumRow * 100);
                
            } else {
                positionX = e.nodeSide ? parentNodeData.positionX - 250 : parentNodeData.positionX + 250;
            }
            positionY = position.y + (row * position.yGap) - 30;
            
            // Set line position
            linePosition.fromX = parentNodeData.positionX + 100;
            linePosition.fromY = parentNodeData.positionY + 100;
            linePosition.toX = positionX + 100;
            linePosition.toY = positionY;
            linePositions.push(linePosition);
        }
        e.positionX = positionX;
        e.positionY = positionY;
    });

    // Append main group
    let g = svg
        .append("g")
        .attr("class", "node");
    
    // Define gradient configuration
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient-border")
        .attr("x1", "0%")
        .attr("y1", "50%")
        .attr("x2", "100%")
        .attr("y2", "50%");
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("style", `stop-color: ${blueColor}; stop-opacity: 1;`);
    gradient.append("stop")
        .attr("offset", "70%")
        .attr("style", `stop-color: ${blueColor}; stop-opacity: 1;`);
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("style", `stop-color: ${grayColor}; stop-opacity: 0.6;`);

    // Draw the playbook header node
    let headerNode = g.append('g')
        .attr('node-id', 'header-node');
    headerNode.append('rect')
        .attr("x", position.x)
        .attr("y", position.y)
        .attr("width", nodeSize.width)
        .attr("height", nodeSize.height - 20)
        .attr("fill", `${grayColor}`)
        .attr("fill-opacity", 0.6)
        .attr("rx", 8)
        .attr("stroke", "url(#gradient-border)")
        .attr("stroke-width", 2)
        .attr("style", "cursor: pointer;");

    for (let i = 1; i <= 3; i++) {
        headerNode.append("line")
            .style("stroke", "#fff")
            .style("stroke-opacity", 1.0)
            .style("stroke-width", 2)
            .attr("x1", position.x + 10)
            .attr("y1", position.y + 10 + nodeSize.lineGap * i)
            .attr("x2", position.x + 178)
            .attr("y2", position.y + 10 + nodeSize.lineGap * i);

        headerNode.append("line")
            .style("stroke", "#fff")
            .style("stroke-opacity", 1.0)
            .style("stroke-width", 1)
            .attr("x1", position.x + 80)
            .attr("y1", position.y + nodeSize.lineGap * i - 5)
            .attr("x2", position.x + 80)
            .attr("y2", position.y + nodeSize.lineGap * i + 5);

        headerNode.append("text")
            .attr("x", position.x + 15)
            .attr("y", position.y + 5 + nodeSize.lineGap * i)
            .attr("font-size", "10px")
            .style("fill", "#fff")
            .text(function() {
                switch(i) {
                    case 1:
                        return 'Rule Name';
                    case 2:
                        return 'Eventname';
                    case 3:
                        return 'Severity';
                    default:
                        return 'Field';
                }
            });

        headerNode.append("text")
            .attr("x", position.x + 90)
            .attr("y", position.y + 5 + nodeSize.lineGap * i)
            .attr("font-size", "10px")
            .style("fill", "#fff")
            .text(function() {
                switch(i) {
                    case 1:
                        return nodeData.header.eventname;
                    case 2:
                        return nodeData.header.ruleName;
                    case 3:
                        return nodeData.header.severity;
                    default:
                        return '';
                }
            });
    }

    // Draw playbook child nodes
    g.selectAll('.node')
        .data(childrenNodeData)
        .join((enter) => {
            let targetNode = enter.append('g')
                .attr('node-id', function(d) {
                    return d.id;
                });
            targetNode.append('rect')
                .attr('node-name', function(d) {
                    return d.name;
                })
                .attr('uuid', function(d) {
                    return d.uuid;
                })
                .attr("x", function(d) {
                    return d.positionX;
                })
                .attr("y", function(d) {
                    return d.positionY;
                })
                .attr("width", nodeSize.width)
                .attr("height", nodeSize.height)
                .attr("fill", `${grayColor}`)
                .attr("fill-opacity", 0.6)
                .attr("rx", 8)
                .attr("stroke", "url(#gradient-border)")
                .attr("stroke-width", 2)
                .attr("style", "cursor: pointer;")
                .on('click', function() {
                    alert('test');
                });
            targetNode.append('svg:image')
                .attr('x', function(d) {
                    return d.positionX - 23;
                })
                .attr('y', function(d) {
                    return d.positionY + 80;
                })
                .attr('width', 20)
                .attr('height', 20)
                .attr('xlink:href', 'img/node_clear_01.png')
                .attr("style", "cursor: pointer;");

            // Draw lines and write text in a node
            for (let i = 1; i <= 4; i++) {
                // Draw line
                targetNode.append("line")
                    .style("stroke", "#fff")
                    .style("stroke-opacity", 1.0)
                    .style("stroke-width", 2)
                    .attr("x1", function(d) {
                        return d.positionX + 10;
                    })
                    .attr("x2", function(d) {
                        return d.positionX + 178;
                    })
                    .attr("y1", function(d) {
                        return d.positionY + 10 + nodeSize.lineGap * i;
                    })
                    .attr("y2", function(d) {
                        return d.positionY + 10 + nodeSize.lineGap * i;
                    });
                targetNode.append("line")
                    .style("stroke", "#fff")
                    .style("stroke-opacity", 1.0)
                    .style("stroke-width", 1)
                    .attr("x1", function(d) {
                        return d.positionX + 65;
                    })
                    .attr("x2", function(d) {
                        return d.positionX + 65;
                    })
                    .attr("y1", function(d) {
                        return d.positionY + nodeSize.lineGap * i - 5;
                    })
                    .attr("y2", function(d) {
                        return d.positionY + nodeSize.lineGap * i + 5;
                    });

                // Write keys
                targetNode.append("text")
                    .attr('x', function(d) {
                        return d.positionX + 15;
                    })
                    .attr('y', function(d) {
                        return d.positionY + 5 + nodeSize.lineGap * i;
                    })
                    .attr("font-size", "10px")
                    .style("fill", "#fff")
                    .text(function() {
                        switch(i) {
                            case 1:
                                return 'Name';
                            case 2:
                                return 'Field';
                            case 3:
                                return 'Value';
                            case 4:
                                return 'Method';
                            default:
                                return 'Field';
                        }
                    });

                // Write values
                targetNode.append("text")
                    .attr('x', function(d) {
                        return d.positionX + 90;
                    })
                    .attr('y', function(d) {
                        return d.positionY + 5 + nodeSize.lineGap * i;
                    })
                    .attr("font-size", "10px")
                    .style("fill", "#fff")
                    .text(function(d) {
                        switch(i) {
                            case 1:
                                return d.name;
                            case 2:
                                return d.field;
                            case 3:
                                return d.value;
                            case 4:
                                return d.method;
                            default:
                                return '';
                        }
                    });
            }
        });

    // Draw finish node
    g.selectAll('.finish-node')
        .data(finishedNodes)
        .join((enter) => {
            let targetTrueNode = enter.append('g');
            // True node
            targetTrueNode
                .append('rect')
                .attr('node-name', function(d) {
                    return d.name;
                })
                .attr('node-true', '')
                .attr('node-false', '')
                .attr("x", function(d) {
                    return d.positionX - 125;
                })
                .attr("y", function(d) {
                    return d.positionY + position.yGap;
                })
                .attr("width", nodeSize.width)
                .attr("height", nodeSize.height)
                .attr("fill", `${grayColor}`)
                .attr("fill-opacity", 0.6)
                .attr("rx", 8)
                .attr("stroke", "url(#gradient-border)")
                .attr("stroke-width", 2)
                .attr("style", "cursor: pointer;");
            targetTrueNode
                .append('text')
                .attr('x', function(d) {
                    return d.positionX - 125 + 100;
                })
                .attr('y', function(d) {
                    return d.positionY + position.yGap + 55;
                })
                .attr('text-anchor', 'middle')
                .attr("font-size", "15px")
                .style("fill", "#595959")
                .text(function(d) {
                    return d.result;
                });
            
            // Flase node
            let targetFalseNode = enter.append('g');
            targetFalseNode
                .append('rect')
                .attr('node-name', function(d) {
                    return d.name;
                })
                .attr('node-true', '')
                .attr('node-false', '')
                .attr("x", function(d) {
                    return d.positionX + 125;
                })
                .attr("y", function(d) {
                    return d.positionY + position.yGap;
                })
                .attr("width", nodeSize.width)
                .attr("height", nodeSize.height)
                .attr("fill", `${grayColor}`)
                .attr("fill-opacity", 0.6)
                .attr("rx", 8)
                .attr("stroke", "url(#gradient-border)")
                .attr("stroke-width", 2)
                .attr("style", "cursor: pointer;");
            targetFalseNode
                .append('text')
                .attr('x', function(d) {
                    return d.positionX + 125 + 100;
                })
                .attr('y', function(d) {
                    return d.positionY + position.yGap + 55;
                })
                .attr('text-anchor', 'middle')
                .attr("font-size", "15px")
                .style("fill", "#595959")
                .text(function(d) {
                    return '분석필요';
                });
        });

    finishedNodes.forEach(e => {
        // Set line position
        let linePositionForTrue = { fromX: 0, toX: 0, fromY: 0, toY: 0 }
        linePositionForTrue.fromX = e.positionX + 100;
        linePositionForTrue.fromY = e.positionY + 100;
        linePositionForTrue.toX = e.positionX - 30;
        linePositionForTrue.toY = e.positionY + 150;

        let linePositionForFalse = { node: '', fromX: 0, toX: 0, fromY: 0, toY: 0 }
        linePositionForFalse.fromX = e.positionX + 100;
        linePositionForFalse.fromY = e.positionY + 100;
        linePositionForFalse.toX = e.positionX + 230;
        linePositionForFalse.toY = e.positionY + 150

        linePositions.push(linePositionForTrue);
        linePositions.push(linePositionForFalse);
    });

    // Draw line header to first child
    g.append('path')
        .attr('d', `M ${position.x + 100} ${position.y + 80} L ${position.x + 100} ${position.y + position.yGap - 30}`)
        .attr('stroke', blueColor)
        .attr('stroke-width', 3);
    g.selectAll('.path')
        .data(linePositions)
        .enter()
        .append('path')
        .attr('d', function(d) {
            return `M ${d.fromX} ${d.fromY} L ${d.toX} ${d.toY}`
        })
        .attr('stroke', blueColor)
        .attr('stroke-width', 3);
}

