import React from "react";
import { useParams } from "react-router-dom";
import styles from "./Generate.module.css";
import GraphView from "../../components/GraphView";

function Generate() {
    const { graphType } = useParams();
    const { weight } = useParams();

    const getGraphType = () => {
        if (graphType === '1') {
            return 'Non-directed ';
        } else if (graphType === '2') {
            return 'Directed ';
        }
    };

    const getGraphWeight = () => {
        return weight === '1' ? 'weighted graph' : 'non-weighted graph';
    };

    return (
        <>
            <div className={styles['generate-body']}>
                <h1 className={styles.title}>{getGraphType()}{getGraphWeight()}</h1>
                <GraphView graphType={graphType} weight={weight} />
            </div>
        </>
    );
}

export default Generate;