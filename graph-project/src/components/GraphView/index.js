import React, { useState } from 'react';
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
    const [targetNode, setTargetNode] = useState('');
    const [edgeWeight, setEdgeWeight] = useState('');

    const addNode = () => {
        if (nodeLabel.trim() !== '') {
            const newNode = {
                data: { id: `${graphData.nodes.length + 1}`, label: nodeLabel }
            };
            setGraphData((prev) => ({
                nodes: [...prev.nodes, newNode],
                edges: prev.edges
            }));
            setNodeLabel('');
        }
    };

    const addEdge = () => {
        // Verifica se os IDs de sourceNode e targetNode realmente existem em graphData.nodes
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

            // Atualiza o estado com a nova aresta
            setGraphData((prev) => ({
                nodes: prev.nodes,
                edges: [...prev.edges, newEdge]
            }));

            // Limpa os inputs após adicionar a aresta
            setSourceNode('');
            setTargetNode('');
            setEdgeWeight('');
        } else {
            alert("Failed! Verify if source and target nodes really exists.");
        }
    };


    const elements = [
        ...graphData.nodes.map(node => ({ data: node.data })),
        ...graphData.edges.map(edge => ({ data: edge.data }))
    ];


    return (
        <div className={styles['graph-container']}>
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
            </div>
            <div className={styles['lower-input']}>
                <div className={styles['input-container']}>
                    <input
                        type="text"
                        value={sourceNode}
                        onChange={(e) => setSourceNode(e.target.value)}
                        placeholder="Source Node ID"
                    />
                </div>
                <div className={styles['input-container']}>
                    <input
                        type="text"
                        value={targetNode}
                        onChange={(e) => setTargetNode(e.target.value)}
                        placeholder="Target Node ID"
                    />
                </div>
                {weight === '1' && (
                    <div className={styles['input-container']}>
                        <input
                            type="text"
                            value={edgeWeight}
                            onChange={(e) => setEdgeWeight(e.target.value)}
                            placeholder="Edge Weight"
                        />
                    </div>
                )}
                <button className={styles['graph-button']} onClick={addEdge}>Add Edge</button>
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
                                "target-arrow-color": "yellow",
                                "target-arrow-shape": "triangle",
                                "curve-style": "bezier",
                                label: "data(weight)"
                            }
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default GraphView;