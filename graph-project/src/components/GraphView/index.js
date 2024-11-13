import React, { useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import styles from './GraphView.module.css';
import jsPDF from 'jspdf';
import { useRef } from 'react';

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

    const [order, setOrder] = useState(0);
    const [size, setSize] = useState(0);

    const [menuOption, setMenuOption] = useState('');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    useEffect(() => {
        setOrder(graphData.nodes.length);
        setSize(graphData.edges.length);
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
            case 'downloadPDF':
                return (
                    <div className={styles['pdf-section']}>
                        <button className={styles['graph-button']} onClick={downloadGraphAsPDF}>Download PDF</button>
                    </div>
                );
            default:
                return (
                    <div className={styles['info-options']}>
                        <button onClick={() => setMenuOption('orderSize')}>See order and size</button>
                        <button onClick={() => setMenuOption('vertexDegree')}>See vertex degree</button>
                        <button onClick={() => setMenuOption('downloadPDF')}>Download Graph as PDF</button>
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
                {!isMenuVisible && (
                    <button
                        className={styles['open-menu-button']}
                        onClick={() => setIsMenuVisible(true)}
                    >
                        Show Menu
                    </button>
                )}
                {isMenuVisible && (
                    <div className={styles['graph-info']}>
                        <button
                            className={styles['close-menu-button']}
                            onClick={() => setIsMenuVisible(false)}
                        >
                            ✖
                        </button>
                        <button className={styles['info-menu']} onClick={() => setMenuOption('')}>Back to Options</button>
                        {renderMenuContent()}
                    </div>
                )}
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
                                textHalign: 'center'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                width: 3,
                                lineColor: '#ff6347',
                                targetArrowColor: '#ff6347',
                                targetArrowShape: graphType === '1' ? 'none' : 'triangle',
                                label: weight === '1' ? 'data(weight)' : ''
                            }
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default GraphView;
