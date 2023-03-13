import React from "react";
import ScatterChartComponent from "./ScatterChartComponent";

const CommunityRenderaComponent = (props: any) => {
    // This Component is rendered when the user clicks on the Community Activeness parameter
    // We call the Scatter Chart Component here and pass the data to it as props and it plots the graph
    return (
        <div className="m-2 mt-5 mb-0 p-2 border border-white">
            <h4 style={{ color: "white" }}>Community Activeness and Maintainance</h4>
            <ScatterChartComponent data={props.data} />
        </div>
    );
}

export default CommunityRenderaComponent;