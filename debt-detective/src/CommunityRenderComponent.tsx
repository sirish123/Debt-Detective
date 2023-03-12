import React from "react";
import ScatterChartComponent from "./ScatterChartComponent";

const CommunityRenderaComponent = (props: any) => {
    return (
        <div className="m-2 mt-5 mb-0 p-2 border border-white">
            <h4 style={{ color: "white" }}>Community Activeness and Maintainance</h4>
            <ScatterChartComponent data={props.data} />
        </div>
    );
}

export default CommunityRenderaComponent;