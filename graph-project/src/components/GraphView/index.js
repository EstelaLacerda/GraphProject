import React, { useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import styles from './GraphView.module.css';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import dijkstra from 'dijkstrajs';
import HelpButton from '../HelpButton';

const GraphView = ({ graphType, weight }) => {
    const [width] = useState("100%");
    const [height] = useState("400px");

    const [graphData, setGraphData] = useState({
        nodes: [],
        edges: []
    });

    const [nodeLabel, setNodeLabel] = useState('');
    const [sourceNode, setSourceNode] = useState('');
    const [nodeIdToRemove, setNodeIdToRemove] = useState('');
    const [targetNode, setTargetNode] = useState('');
    const [edgeWeight, setEdgeWeight] = useState('');
    const [vertexId, setVertexId] = useState('');
    const [vertexDegree, setVertexDegree] = useState(null);

    const [adjSourceNode, setAdjSourceNode] = useState('');
    const [adjTargetNode, setAdjTargetNode] = useState('');

    const [order, setOrder] = useState(0);
    const [size, setSize] = useState(0);

    const [menuOption, setMenuOption] = useState('');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const [adjacencyMatrix, setAdjacencyMatrix] = useState([]);
    const [adjacencyList, setAdjacencyList] = useState({});

    const [shortestPath, setShortestPath] = useState(null);
    const [shortestPathCost, setShortestPathCost] = useState(null);

    const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

    useEffect(() => {
        setOrder(graphData.nodes.length);
        setSize(graphData.edges.length);
        generateAdjacencyMatrix();
    }, [graphData]);

    const calculateVertexDegree = () => {
        const degree = graphData.edges.reduce((count, edge) => {
            if (edge.data.source === vertexId || edge.data.target === vertexId) {
                return count + 1;
            }
            return count;
        }, 0);

        setVertexDegree(degree);
    };

    const generateAdjacencyMatrix = () => {
        const nodeIds = graphData.nodes.map(node => node.data.id);
        const matrix = nodeIds.map(() => Array(nodeIds.length).fill(0));
        const list = {};

        graphData.edges.forEach(edge => {
            const source = edge.data.source;
            const target = edge.data.target;

            if (!list[source]) list[source] = [];
            if (!list[target]) list[target] = [];

            if (graphType === '1') {
                if (!list[source].includes(target)) list[source].push(target);
                if (!list[target].includes(source)) list[target].push(source);
            } else if (graphType === '2') {
                if (!list[source].includes(target)) list[source].push(target);
            }

            const sourceIndex = nodeIds.indexOf(source);
            const targetIndex = nodeIds.indexOf(target);

            if (sourceIndex !== -1 && targetIndex !== -1) {
                matrix[sourceIndex][targetIndex] = edge.data.weight || 1;
                if (graphType === '1') {
                    matrix[targetIndex][sourceIndex] = edge.data.weight || 1;
                }
            }
        });

        setAdjacencyMatrix(matrix);
        setAdjacencyList(list);
    };


    const areAdjacent = (vertex1, vertex2) => {
        const adjacentVertices = adjacencyList[vertex1];
        return adjacentVertices ? adjacentVertices.includes(vertex2) : false;
    };

    const checkAdjacency = () => {
        if (adjSourceNode && adjTargetNode) {
            if (graphType === '2') {
                const outgoingVertices = adjacencyList[adjSourceNode] || [];
                const incomingVertices = Object.keys(adjacencyList).filter(
                    node => adjacencyList[node]?.includes(adjTargetNode)
                );

                const isOutgoing = outgoingVertices.includes(adjTargetNode);
                const isIncoming = incomingVertices.includes(adjSourceNode);

                if (isOutgoing) {
                    alert(
                        `The vertex ${adjSourceNode} has an outgoing edge to ${adjTargetNode} (directed graph).`
                    );
                } else if (isIncoming) {
                    alert(
                        `The vertex ${adjTargetNode} has an incoming edge from ${adjSourceNode} (directed graph).`
                    );
                } else {
                    alert(`The vertices ${adjSourceNode} and ${adjTargetNode} are not adjacent in this directed graph.`);
                }
            } else {
                const isAdjacent = areAdjacent(adjSourceNode, adjTargetNode);
                alert(
                    `The vertices ${adjSourceNode} and ${adjTargetNode} are ${isAdjacent ? '' : 'not '
                    }adjacent.`
                );
            }
        } else {
            alert("Please enter both vertices to check adjacency.");
        }
    };


    const addNode = () => {
        if (nodeLabel.trim() !== '') {
            const labels = nodeLabel.split(',').map(label => label.trim());

            const newNodes = labels.map((label, index) => {
                const id = graphData.nodes.length + index + 1;
                return {
                    data: { id, label: `${id}: ${label}` },
                    position: { x: parseInt(width) / 2, y: parseInt(height) / 2 }
                }
            });

            setGraphData(prev => ({
                nodes: [...prev.nodes, ...newNodes],
                edges: prev.edges
            }));

            setNodeLabel('');
        }
    };

    const addEdge = () => {
        const sourceExists = graphData.nodes.some(node => node.data.id === sourceNode);
        const targetExists = graphData.nodes.some(node => node.data.id === targetNode);

        if (sourceExists && targetExists) {
            const newEdge = {
                data: {
                    source: sourceNode,
                    target: targetNode,
                    weight: edgeWeight || null
                }
            };

            setGraphData((prev) => ({
                nodes: prev.nodes,
                edges: [...prev.edges, newEdge]
            }));

            setSourceNode('');
            setTargetNode('');
            setEdgeWeight('');
        } else {
            alert("Failed! Verify if source and target nodes really exist.");
        }
    };

    const removeNode = () => {
        const nodeIdsToRemove = nodeIdToRemove.split(',').map(id => id.trim());

        const nodesExist = nodeIdsToRemove.some(id =>
            graphData.nodes.some(node => node.data.id === id)
        );

        if (!nodesExist) {
            alert(`One or more nodes with IDs ${nodeIdsToRemove.join(', ')} do not exist.`);
            return;
        }

        setGraphData((prev) => {
            const updatedNodes = prev.nodes.filter(
                node => !nodeIdsToRemove.includes(node.data.id)
            );
            const updatedEdges = prev.edges.filter(
                edge => !nodeIdsToRemove.includes(edge.data.source) &&
                    !nodeIdsToRemove.includes(edge.data.target)
            );
            return {
                nodes: updatedNodes,
                edges: updatedEdges
            };
        });

        setNodeIdToRemove('');
    };

    const cyRef = useRef(null);

    const getTitle = () => {
        const typeTitle = graphType === '1' ? 'Non-directed' : 'Directed';
        const weightTitle = weight === '1' ? 'Weighted Graph' : 'Non-weighted Graph';
        return `${typeTitle} - ${weightTitle}`;
    };

    const downloadGraphAsPDF = () => {
        if (cyRef.current) {
            const pngData = cyRef.current.png({ full: true, scale: 3 });

            const graphDiv = document.querySelector(`.${styles['graph']}`);
            const graphWidth = graphDiv.offsetWidth;
            const graphHeight = graphDiv.offsetHeight;

            const pdf = new jsPDF('landscape', 'pt', [graphWidth, graphHeight]);

            const title = getTitle();
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const titleWidth = pdf.getTextWidth(title);

            const titleYPosition = 40;
            pdf.text(title, (pdfWidth - titleWidth) / 2, titleYPosition);

            const margin = 20;

            const imgProps = pdf.getImageProperties(pngData);
            const imgWidth = graphWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            const availableHeight = graphHeight - titleYPosition - margin;

            const scaleFactor = Math.min(graphWidth / imgWidth, (availableHeight) / imgHeight);
            const finalImgWidth = imgWidth * scaleFactor;
            const finalImgHeight = imgHeight * scaleFactor;

            const yPosition = titleYPosition + margin;

            const xPosition = (pdfWidth - finalImgWidth) / 2;

            pdf.addImage(pngData, 'PNG', xPosition, yPosition, finalImgWidth, finalImgHeight);

            pdf.save('graph.pdf');
        }
    };

    const calculateShortestPath = () => {
        if (adjSourceNode && adjTargetNode) {
            const graph = {};
            graphData.nodes.forEach(node => {
                graph[node.data.id] = {};
            });

            graphData.edges.forEach(edge => {
                const { source, target, weight } = edge.data;
                graph[source][target] = parseFloat(weight) || 1;
                if (graphType === '1') {
                    graph[target][source] = parseFloat(weight) || 1;
                }
            });

            try {
                const path = dijkstra.find_path(graph, adjSourceNode, adjTargetNode);
                const cost = path.reduce((total, currentNode, index) => {
                    if (index === 0) return total;
                    const previousNode = path[index - 1];
                    return total + graph[previousNode][currentNode];
                }, 0);

                setShortestPath(path);
                setShortestPathCost(cost);
            } catch (error) {
                alert('No path found between the given nodes.');
            }
        } else {
            alert("Please enter both source and target vertices to calculate the shortest path.");
        }
    };

    const elements = [
        ...graphData.nodes.map(node => ({ data: node.data })),
        ...graphData.edges.map(edge => ({ data: edge.data }))
    ];

    const renderMenuContent = () => {
        switch (menuOption) {
            case 'orderSize':
                return (
                    <div className={styles['order-size-info']}>
                        <p>Graph order: {order}</p>
                        <p>|</p>
                        <p>Graph size: {size}</p>
                    </div>
                );
            case 'vertexDegree':
                return (
                    <div className={styles['vertex-degree']}>
                        <div className={styles['input-degree']}>
                            <input
                                type="text"
                                value={vertexId}
                                onChange={(e) => setVertexId(e.target.value)}
                                placeholder="Enter Vertex ID for Degree"
                            />
                        </div>
                        <button className={styles['degree-button']} onClick={calculateVertexDegree}>Calculate Degree</button>
                        {vertexDegree !== null && <p>Degree of Vertex {vertexId}: {vertexDegree}</p>}
                    </div>
                );
            case 'adjacencyMatrix':
                return (
                    <div className={styles['matrix-display']}>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    {graphData.nodes.map(node => (
                                        <th key={node.data.id}>{node.data.id}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {adjacencyMatrix.map((row, i) => (
                                    <tr key={i}>
                                        <td>{graphData.nodes[i].data.id}</td>
                                        {row.map((cell, j) => (
                                            <td key={j}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {graphType === '2' && (
                            <div>
                                <h4>Directed Graph Adjacency Details</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Node</th>
                                            <th>Outgoing Vertices</th>
                                            <th>Incoming Vertices</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(adjacencyList).map(nodeId => {
                                            const outgoingVertices = adjacencyList[nodeId] || [];
                                            const incomingVertices = Object.keys(adjacencyList).filter(
                                                otherNode => adjacencyList[otherNode]?.includes(nodeId)
                                            );
                                            return (
                                                <tr key={nodeId}>
                                                    <td>{nodeId}</td>
                                                    <td>{outgoingVertices.join(', ') || 'None'}</td>
                                                    <td>{incomingVertices.join(', ') || 'None'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'adjacencyList':
                return (
                    <div className={styles['list-display']}>
                        <h3>Adjacency List</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Node</th>
                                    {graphType === '2' ? (
                                        <>
                                            <th>Outgoing Vertices</th>
                                            <th>Incoming Vertices</th>
                                        </>
                                    ) : (
                                        <th>Adjacents</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(adjacencyList).map(nodeId => {
                                    if (graphType === '2') {
                                        const outgoingVertices = adjacencyList[nodeId] || [];
                                        const incomingVertices = Object.keys(adjacencyList).filter(
                                            otherNode => adjacencyList[otherNode].includes(nodeId)
                                        );
                                        return (
                                            <tr key={nodeId}>
                                                <td>{nodeId}</td>
                                                <td>{outgoingVertices.join(', ') || 'None'}</td>
                                                <td>{incomingVertices.join(', ') || 'None'}</td>
                                            </tr>
                                        );
                                    } else {
                                        return (
                                            <tr key={nodeId}>
                                                <td>{nodeId}</td>
                                                <td>{adjacencyList[nodeId].join(', ')}</td>
                                            </tr>
                                        );
                                    }
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            case 'downloadPDF':
                return (
                    <div className={styles['pdf-section']}>
                        <button className={styles['pdf-button']} onClick={downloadGraphAsPDF}>Download PDF</button>
                    </div>
                );
            case 'adjacencyCheck':
                return (
                    <div className={styles['adjacency-check']}>
                        <h3>Check Adjacency</h3>
                        <input
                            type="text"
                            value={adjSourceNode}
                            onChange={(e) => setAdjSourceNode(e.target.value)}
                            placeholder="Enter Source Vertex ID"
                            className={styles['input']}
                        />
                        <input
                            type="text"
                            value={adjTargetNode}
                            onChange={(e) => setAdjTargetNode(e.target.value)}
                            placeholder="Enter Target Vertex ID"
                            className={styles['input']}
                        />
                        <button className={styles['check-button']} onClick={checkAdjacency}>
                            Check if Adjacent
                        </button>
                    </div>
                );

            case 'shortestPathAlgorithm':
                return (
                    <div className={styles['shortest-path-section']}>
                        <h3>Shortest Path Algorithm</h3>
                        <input
                            type="text"
                            value={adjSourceNode}
                            onChange={(e) => setAdjSourceNode(e.target.value)}
                            placeholder="Enter Source Vertex ID"
                            className={styles['input']}
                        />
                        <input
                            type="text"
                            value={adjTargetNode}
                            onChange={(e) => setAdjTargetNode(e.target.value)}
                            placeholder="Enter Target Vertex ID"
                            className={styles['input']}
                        />
                        <button className={styles['calculate-button']} onClick={calculateShortestPath}>
                            Calculate Shortest Path
                        </button>
                        {shortestPath && (
                            <div className={styles['shortest-path-result']}>
                                <p>Shortest Path: {shortestPath.join(' -> ')}</p>
                                <p>Path Cost: {shortestPathCost}</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className={styles['info-options']}>
                        <button onClick={() => setMenuOption('orderSize')}>See order and size</button>
                        <button onClick={() => setMenuOption('vertexDegree')}>See vertex degree</button>
                        <button onClick={() => setMenuOption('adjacencyCheck')}>Check Adjacency</button>
                        <button onClick={() => setMenuOption('downloadPDF')}>Download Graph as PDF</button>
                        <button onClick={() => setMenuOption('adjacencyMatrix')}>See Adjacency Matrix</button>
                        <button onClick={() => setMenuOption('adjacencyList')}>See Adjacency List</button>
                        <button onClick={() => setMenuOption('shortestPathAlgorithm')}>Shortest Path Algorithm</button>
                    </div>
                );
        }
    };

    return (
        <div className={styles['graph-container']}>
            <div className={styles['graph-header']}>
                <div className={styles['graph-input']}>
                    <div className={styles['upper-input']}>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={nodeLabel}
                                onChange={(e) => setNodeLabel(e.target.value)}
                                placeholder="Node Label"
                            />
                        </div>
                        <button className={styles['graph-button']} onClick={addNode}>Add Node</button>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={nodeIdToRemove}
                                onChange={(e) => setNodeIdToRemove(e.target.value)}
                                placeholder="Node ID to Remove"
                            />
                        </div>
                        <button className={styles['remove-button']} onClick={removeNode}>Remove Node</button>
                    </div>
                    <div className={styles['lower-input']}>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={sourceNode}
                                onChange={(e) => setSourceNode(e.target.value)}
                                placeholder={graphType === '1' ? "First node" : "Source Node ID"}
                            />
                        </div>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={targetNode}
                                onChange={(e) => setTargetNode(e.target.value)}
                                placeholder={graphType === '1' ? "Second node" : "Target Node ID"}
                            />
                        </div>
                        {weight === '1' && (
                            <div className={styles['input-container']}>
                                <input
                                    type="number"
                                    value={edgeWeight}
                                    onChange={(e) => setEdgeWeight(e.target.value)}
                                    placeholder="Edge Weight"
                                />
                            </div>
                        )}
                        <button className={styles['graph-button']} onClick={addEdge}>Add Edge</button>
                    </div>
                </div>
                <button
                    className={styles['open-menu-button']}
                    onClick={toggleMenu}
                >
                    {isMenuVisible ? 'Close Menu' : 'Show Menu'}
                </button>

                <div className={`${styles['graph-info']} ${isMenuVisible ? styles['show'] : ''}`}>
                    <button
                        className={styles['close-menu-button']}
                        onClick={toggleMenu}
                    >
                        ✖
                    </button>
                    <button className={styles['info-menu']} onClick={() => setMenuOption('')}>Back to Options</button>
                    {renderMenuContent()}
                </div>
            </div>
            <div className={styles['graph']}>
                <CytoscapeComponent
                    cy={(cy) => (cyRef.current = cy)}
                    elements={elements}
                    style={{ width: width, height: height }}
                    layout={{
                        name: 'cose',
                        idealEdgeLength: 100,
                        nodeRepulsion: 400000,
                        nodeOverlap: 10,
                        fit: true,
                        padding: 50,
                        animate: true,
                        componentSpacing: 100,
                        numIter: 1000,
                        coolingFactor: 0.99,
                        gravity: 200,
                        initialTemp: 1000
                    }}
                    stylesheet={[
                        {
                            selector: 'node',
                            style: {
                                label: 'data(label)',
                                backgroundColor: '#69b3a2',
                                color: 'black',
                                fontWeight: 'bold',
                                textValign: 'center',
                                textHalign: 'center',
                                width: '50px',
                                height: '50px'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                width: 3,
                                lineColor: '#ff6347',
                                targetArrowColor: '#ff6347',
                                targetArrowShape: graphType === '1' ? 'none' : 'triangle',
                                label: weight === '1' ? 'data(weight)' : '',
                                curveStyle: 'bezier',
                                controlPointDistance: 20,
                                controlPointWeight: 0.5
                            }
                        }
                    ]}
                />
            </div>
            <HelpButton />
        </div>
    );
};

export default GraphView;
