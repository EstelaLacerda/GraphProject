import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Menu.module.css"

function Menu() {

    const navigate = useNavigate();

    const handleUserClick = (graphType) => {
        navigate(`/graph/${graphType}`);
    };

    return (
        <>
            <body className={styles['menu-body']}>
                <div className={styles.container}>
                    <h1 data-text='Gramor (Grafos + Amor)' className={styles.title}>Gramor (Grafos + Amor)</h1>
                    <p className={styles.subtitle}>Select the type of graph you want to generate</p>
                    <div className={styles['button-container']}>
                        <button className={styles.button} onClick={() => handleUserClick('1')}>Non-directed Graph</button>
                        <button className={styles.button} onClick={() => handleUserClick('2')}>Directed Graph</button>
                    </div>
                    <img className={styles.logo} src="/images/logo.png" alt="logo"/>
                </div>
            </body>
        </>
    );
}

export default Menu;