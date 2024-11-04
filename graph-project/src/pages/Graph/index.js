import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from './Graph.module.css'

function Graph() {

    const navigate = useNavigate();

    const { graphType } = useParams();

    const getGraphType = () => {
        if (graphType === '1') {
            return 'Non-directed graph';
        } else if (graphType === '2') {
            return 'Directed graph';
        }
    }

    const handleUserClick = (graphType) => {
        navigate(`/generate/${graphType}`);
    };

    const backHome = () => {
        navigate('/');
    };

    return (
        <>
            <div className={styles['graph-body']}>
                <div className={styles['graph-container']}>
                    <h1 className={styles.title}>{getGraphType()}</h1>
                    <div className={styles['button-container']}>
                        <button className={styles.button} onClick={() => handleUserClick('1')}>Weighted Graph</button>
                        <button className={styles.button} onClick={() => handleUserClick('2')}>Non-Weighted Graph</button>
                        <button className={styles['back-button']} onClick={() => backHome()}>Go back</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Graph;