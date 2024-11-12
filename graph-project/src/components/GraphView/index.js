import React, { useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import styles from './GraphView.module.css';

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

    const [order, setOrder] = useState(0); // Número de nós
    const [size, setSize] = useState(0); // Número de arestas

    useEffect(() => {
        setOrder(graphData.nodes.length);
        setSize(graphData.edges.length);
    }, [graphData]);

    const addNode = () => {
        if (nodeLabel.trim() !== '') {
            const labels = nodeLabel.split(',').map(label => label.trim());

            const newNodes = labels.map((label, index) => {
                const id = `${graphData.nodes.length + index + 1}`;
                return {
                    data: { id, label: `${id}: ${label}` },
                    position: { x: parseInt(width) / 2, y: parseInt(height) / 2 }
                };
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
            alert("Failed! Verify if source and target nodes really exists.");
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

    const elements = [
        ...graphData.nodes.map(node => ({ data: node.data })),
        ...graphData.edges.map(edge => ({ data: edge.data }))
    ];

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
                <div className={styles['graph-info']}>
                    <p>Ordem do Grafo (Número de Nós): {order}</p>
                    <p>Tamanho do Grafo (Número de Arestas): {size}</p>
                </div>
            </div>
            <div className={styles['graph']}>
                <CytoscapeComponent
                    elements={elements}
                    style={{ width: width, height: height }}
                    layout={{
                        name: graphType === '1' ? 'concentric' : 'breadthfirst',
                        fit: true,
                        directed: graphType === '2',
                        padding: 50,
                        animate: true,
                        animationDuration: 1000,
                        avoidOverlap: true,
                        nodeDimensionsIncludeLabels: false
                    }}
                    stylesheet={[
                        {
                            selector: "node",
                            style: {
                                backgroundColor: "#666",
                                width: 60,
                                height: 60,
                                label: "data(label)",
                                "text-valign": "center",
                                "text-halign": "center",
                                "overlay-padding": "6px",
                                "z-index": "10"
                            }
                        },
                        {
                            selector: "edge",
                            style: {
                                width: 3,
                                "line-color": "yellow",
                                "curve-style": "bezier",
                                label: "data(weight)",
                                ...(graphType === '1'
                                    ? {}
                                    : {
                                        "target-arrow-color": "yellow",
                                        "target-arrow-shape": "triangle"
                                    })
                            }
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default GraphView;
