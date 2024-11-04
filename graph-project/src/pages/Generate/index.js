import React from "react";
import { useParams } from "react-router-dom";
import styles from "./Generate.module.css";

function Generate() {

    const { graphType } = useParams();
    const { weight } = useParams();

    const getGraphType = () => {
        if (graphType === '1') {
            return 'Non-directed ';
        } else if (graphType === '2') {
            return 'Directed ';
        }
    }

    const getGraphWeight = () => {
        if (weight === '1') {
            return 'weigted graph'
        } else if (weight === '0') {
            return 'non-weighted graph'
        }
    }
    
    return(
        <>
            <div className={styles['generate-body']}>
                <h1 className={styles.title}>{getGraphType()}{getGraphWeight()}</h1>
            </div>
        </>
    );
}

export default Generate;