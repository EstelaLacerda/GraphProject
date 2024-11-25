import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CytoscapeComponent from 'react-cytoscapejs';
import styles from './GraphView.module.css';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import dijkstra from 'dijkstrajs';
import HelpButton from '../HelpButton';
import Papa from 'papaparse';

const GraphView = ({ graphType, weight }) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(`/`);
    };

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
    const [edgeSource, setEdgeSource] = useState('');
    const [edgeTarget, setEdgeTarget] = useState('');
    const [vertexId, setVertexId] = useState('');
    const [vertexDegree, setVertexDegree] = useState({
        inDegree: null,
        outDegree: null,
        totalDegree: null,
        message: null
    });

    const [adjSourceNode, setAdjSourceNode] = useState('');
    const [adjTargetNode, setAdjTargetNode] = useState('');
    const [adjacencyMessage, setAdjacencyMessage] = useState('');

    const [order, setOrder] = useState(0);
    const [size, setSize] = useState(0);

    const [menuOption, setMenuOption] = useState('');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const [adjacencyMatrix, setAdjacencyMatrix] = useState([]);
    const [adjacencyList, setAdjacencyList] = useState({});

    const [shortestPath, setShortestPath] = useState(null);
    const [shortestPathCost, setShortestPathCost] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const [isHelpOpen, setIsHeplOpen] = useState(false);

    const showHelp = () => {
        setIsHeplOpen(!isHelpOpen);
    };

    const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

    useEffect(() => {
        setOrder(graphData.nodes.length);
        setSize(graphData.edges.length);
        generateAdjacencyMatrix();
    }, [graphData]);

    const calculateVertexDegree = () => {
        if (!vertexId.trim()) {
            setVertexDegree({
                inDegree: null,
                outDegree: null,
                totalDegree: null,
                message: "Please enter a valid vertex ID."
            });
            return;
        }

        if (graphType === '2') {
            let inDegree = 0;
            let outDegree = 0;
            let totalDegree = 0;

            graphData.edges.forEach((edge) => {
                if (edge.data.source === vertexId) {
                    outDegree++;
                }
                if (edge.data.target === vertexId) {
                    inDegree++;
                }
            });

            totalDegree = inDegree + outDegree;

            setVertexDegree({
                inDegree,
                outDegree,
                totalDegree,
                message: null
            });
        } else {
            const totalDegree = graphData.edges.reduce((count, edge) => {
                if (edge.data.source === vertexId || edge.data.target === vertexId) {
                    return count + 1;
                }
                return count;
            }, 0);

            setVertexDegree({
                inDegree: null,
                outDegree: null,
                totalDegree,
                message: null
            });
        }
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
                const isOutgoing = outgoingVertices.includes(adjTargetNode);
                const incomingVertices = adjacencyList[adjTargetNode] || [];
                const isIncoming = incomingVertices.includes(adjSourceNode);

                if (isOutgoing) {
                    setAdjacencyMessage(
                        `The vertex ${adjSourceNode} has an outgoing edge to ${adjTargetNode} (directed graph).\nThey're adjacent`
                    );
                } else if (isIncoming) {
                    setAdjacencyMessage(
                        `The vertex ${adjTargetNode} has an incoming edge from ${adjSourceNode} (directed graph). \nThey're adjacent`
                    );
                } else {
                    setAdjacencyMessage(
                        `The vertices ${adjSourceNode} and ${adjTargetNode} are not adjacent in this directed graph.`
                    );
                }
            } else {
                const isAdjacent = areAdjacent(adjSourceNode, adjTargetNode);
                setAdjacencyMessage(
                    `The vertices ${adjSourceNode} and ${adjTargetNode} are ${isAdjacent ? '' : 'not '}adjacent.`
                );
            }
        } else {
            setAdjacencyMessage("Please enter both vertices to check adjacency.");
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

    const removeEdge = () => {
        if (!edgeSource.trim() || !edgeTarget.trim()) {
            alert("Please enter valid source and target node IDs.");
            return;
        }

        const edgeExists = graphData.edges.some(edge => {
            if (graphType === '1') {
                // Para grafos não direcionados, verifica ambas as direções
                return (
                    (edge.data.source === edgeSource && edge.data.target === edgeTarget) ||
                    (edge.data.source === edgeTarget && edge.data.target === edgeSource)
                );
            } else {
                return edge.data.source === edgeSource && edge.data.target === edgeTarget;
            }
        });

        if (!edgeExists) {
            alert(`The edge between ${edgeSource} and ${edgeTarget} does not exist.`);
            return;
        }

        setGraphData(prev => {
            const updatedEdges = prev.edges.filter(edge => {
                if (graphType === '1') {
                    return !(
                        (edge.data.source === edgeSource && edge.data.target === edgeTarget) ||
                        (edge.data.source === edgeTarget && edge.data.target === edgeSource)
                    );
                } else {
                    return !(edge.data.source === edgeSource && edge.data.target === edgeTarget);
                }
            });

            return {
                nodes: prev.nodes,
                edges: updatedEdges
            };
        });

        setEdgeSource('');
        setEdgeTarget('');
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

    const isEulerian = () => {
        if (graphType === '1') {
            const hasAllEvenDegrees = graphData.nodes.every(node => {
                const totalDegree = graphData.edges.reduce((count, edge) => {
                    if (edge.data.source === node.data.id || edge.data.target === node.data.id) {
                        return count + 1;
                    }
                    return count;
                }, 0);
                return totalDegree % 2 === 0;
            });

            if (hasAllEvenDegrees) {
                alert('O grafo é Euleriano');
            } else {
                alert('O grafo não é Euleriano');
            }
        }
        else if (graphType === '2') {
            const inDegrees = {};
            const outDegrees = {};

            graphData.nodes.forEach(node => {
                inDegrees[node.data.id] = 0;
                outDegrees[node.data.id] = 0;
            });

            graphData.edges.forEach(edge => {
                outDegrees[edge.data.source]++;
                inDegrees[edge.data.target]++;
            });

            const isEulerian = graphData.nodes.every(node => {
                return inDegrees[node.data.id] === outDegrees[node.data.id];
            });

            if (isEulerian) {
                alert('O grafo é Euleriano');
            } else {
                alert('O grafo não é Euleriano');
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const nodes = [];
                const edges = [];

                results.data.forEach(row => {
                    if (row['NODE ID'] && row['Label']) {
                        const nodeId = row['NODE ID'].toString().trim();
                        if (!nodes.some(node => node.data.id === nodeId)) {
                            nodes.push({
                                data: { id: nodeId, label: row['Label'].trim() },
                                position: { x: Math.random() * 400, y: Math.random() * 400 }
                            });
                        }
                    }

                    if (row['Source'] && row['Target']) {
                        const sourceId = row['Source'].toString().trim();
                        const targetId = row['Target'].toString().trim();

                        const edgeWeight = (weight === '1' && row['Weight']) ? parseFloat(row['Weight']) : null;

                        if (sourceId && targetId) {
                            edges.push({
                                data: {
                                    source: sourceId,
                                    target: targetId,
                                    weight: edgeWeight
                                }
                            });
                        }
                    }
                });

                if (nodes.length > 0) {
                    setGraphData({ nodes, edges });
                    setMenuOption('');
                } else {
                    alert("Erro: Nenhum nó ou aresta válido encontrado no CSV.");
                }
            },
            error: (error) => {
                alert("Erro ao processar o arquivo: " + error.message);
            }
        });
    };

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
                        <button className={styles['degree-button']} onClick={calculateVertexDegree}>
                            Calculate Degree
                        </button>
                        {vertexDegree.message && <p className={styles['error-message']}>{vertexDegree.message}</p>}

                        {graphType === '2' && vertexDegree.inDegree !== null && (
                            <div className={styles['degree-info']}>
                                <p>Vertex {vertexId}:</p>
                                <p>Outgoing edges: {vertexDegree.outDegree}</p>
                                <p>Incoming edges: {vertexDegree.inDegree}</p>
                                <p>Total Degree: {vertexDegree.totalDegree}</p>
                            </div>
                        )}

                        {graphType !== '2' && vertexDegree.totalDegree !== null && (
                            <p className={styles['degree-info']}>
                                Vertex {vertexId} has a total degree of: {vertexDegree.totalDegree}
                            </p>
                        )}
                    </div>
                );
            case 'adjacencyMatrix':
                return (
                    <div>
                        <button onClick={toggleModal} className={styles['open-modal-button']}>
                            Open Adjacency Matrix
                        </button>
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
                                            <th>Outgoing Nodes</th>
                                            <th>Incoming Nodes</th>
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
                        <div className={styles['adj-input']}>
                            <input
                                type="text"
                                value={adjSourceNode}
                                onChange={(e) => setAdjSourceNode(e.target.value)}
                                placeholder="Enter Source Vertex ID"
                            />
                        </div>
                        <div className={styles['adj-input']}>
                            <input
                                type="text"
                                value={adjTargetNode}
                                onChange={(e) => setAdjTargetNode(e.target.value)}
                                placeholder="Enter Target Vertex ID"
                            />
                        </div>
                        <button className={styles['check-button']} onClick={checkAdjacency}>
                            Check if Adjacent
                        </button>
                        {adjacencyMessage && <p className={styles['adjacency-result']}>{adjacencyMessage}</p>}
                    </div>
                );
            case 'shortestPathAlgorithm':
                return (
                    <div className={styles['shortest-path-section']}>
                        <h3>Shortest Path Algorithm</h3>
                        <div className={styles['path-input']}>
                            <input
                                type="text"
                                value={adjSourceNode}
                                onChange={(e) => setAdjSourceNode(e.target.value)}
                                placeholder="Enter Source Vertex ID"
                            />
                        </div>
                        <div className={styles['path-input']}>
                            <input
                                type="text"
                                value={adjTargetNode}
                                onChange={(e) => setAdjTargetNode(e.target.value)}
                                placeholder="Enter Target Vertex ID"
                            />
                        </div>
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
            case 'eulerianCheck':
                return (
                    <div className={styles['eulerian-check']}>
                        <button className={styles['eulerian-button']} onClick={isEulerian}>
                            Check if Eulerian
                        </button>
                    </div>
                );
            case 'uploadCSV':
                return (
                    <div className={styles['csv-upload']}>
                        <h3>Upload CSV File</h3>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            id='fileUpload'
                            placeholder='Coose a CSV file'
                        />
                        <label htmlFor="fileUpload">Choose a CSV file</label>
                        <button onClick={showHelp} className={styles['csv-help']}>About the file</button>
                    </div>
                );
            case 'removeEdge':
                return (
                    <div className={styles['remove-edge']}>
                        <h3>Remove Edge</h3>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={edgeSource}
                                onChange={(e) => setEdgeSource(e.target.value)}
                                placeholder="Enter Source Node ID"
                            />
                        </div>
                        <div className={styles['input-container']}>
                            <input
                                type="text"
                                value={edgeTarget}
                                onChange={(e) => setEdgeTarget(e.target.value)}
                                placeholder="Enter Target Node ID"
                            />
                        </div>
                        <button className={styles['remove-button']} onClick={removeEdge}>
                            Remove Edge
                        </button>
                    </div>
                );
            default:
                return (
                    <div className={styles['info-options']}>
                        <button onClick={() => setMenuOption('orderSize')}>See order and size</button>
                        <button onClick={() => setMenuOption('vertexDegree')}>See vertex degree</button>
                        <button onClick={() => setMenuOption('removeEdge')}>Remove Edge</button>
                        <button onClick={() => setMenuOption('adjacencyCheck')}>Check Adjacency</button>
                        <button onClick={() => setMenuOption('downloadPDF')}>Download Graph as PDF</button>
                        <button onClick={() => setMenuOption('adjacencyMatrix')}>See Adjacency Matrix</button>
                        <button onClick={() => setMenuOption('adjacencyList')}>See Adjacency List</button>
                        <button onClick={() => setMenuOption('shortestPathAlgorithm')}>Shortest Path Algorithm</button>
                        <button onClick={() => setMenuOption('eulerianCheck')}>Check if Eulerian</button>
                        <button onClick={() => setMenuOption('uploadCSV')}>Upload CSV</button>
                    </div>
                );
        }
    };

    return (
        <div className={styles['graph-container']}>
            {isModalOpen && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <button className={styles['close-button']} onClick={toggleModal}>
                            ✖
                        </button>
                        <div className={styles['matrix-display']}>
                            <h3>Adjacency Matrix</h3>
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
                    </div>
                </div>
            )}
            {isHelpOpen && (
                <div className={styles['help-modal']}>
                    <div className={styles['help-content']}>
                        <button className={styles['close-button']} onClick={showHelp}>
                            ✖
                        </button>
                        <h3>About the file</h3>
                        <p>
                            To upload a file to the system, it must be a .csv formatted as shown in the following images.
                        </p>
                        <div className={styles['guide-container']}>
                            <div className={styles['guide-content']}>
                                <h4>Non-weighted</h4>
                                <img src='/images/non-weight.png' alt='non-weighted csv example' />
                            </div>
                            <div className={styles['guide-content']}>
                                <h4>Weighted</h4>
                                <img src='/images/weight.png' alt='non-weighted csv example' />
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                {!isMenuVisible && (
                    <>
                        <div className={styles['above-buttons']}>
                            <button
                                className={styles['open-menu-button']}
                                onClick={toggleMenu}
                            >
                                Show Menu
                            </button>
                            <button
                                className={styles['back-menu-button']}
                                onClick={goBack}
                            >
                                Go Back
                            </button>
                        </div>
                    </>
                )}

                <div className={`${styles['graph-info']} ${isMenuVisible ? styles['show'] : ''}`}>
                    <button
                        className={styles['close-menu-button']}
                        onClick={toggleMenu}
                    >
                        ✖
                    </button>
                    {menuOption && (
                        <button className={styles['info-menu']} onClick={() => setMenuOption('')}>
                            Back to Options
                        </button>
                    )}
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
