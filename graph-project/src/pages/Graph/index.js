import React from "react";
import { useParams } from "react-router-dom";

function Graph() {

    const { graphType } = useParams();

    const getGraphType = () => {
        if (graphType === '1') {
            return 'Non-directed graph';
        } else if (graphType === '2') {
            return 'Directed graph';
        }
    }

    return(
        <>
            <h1>{getGraphType()}</h1>
        </>
    );
}

export default Graph;