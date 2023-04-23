import React, {useState} from "react";
import ScatterChartComponent from "./ScatterChartComponent";

const CommunityRenderaComponent = (props: any) => {
    // This Component is rendered when the user clicks on the Community Activeness parameter
    // We call the Scatter Chart Component here and pass the data to it as props and it plots the graph

    const [open, setOpen] = useState(-1);

    // This function is used to render the sub-parameters and their scores
    const data = props.data.community;

    const handleClick = (index: number) => {
        if(open === index) {
            setOpen(-1);
            return;
        }
        setOpen(index);
    }

    return (
        <div className="m-2 mt-5 mb-0 p-2 m-1">
            <h4 style={{ color: "white" }}>Community Activeness and Maintainance</h4>
            <ScatterChartComponent data={props.data} />
            <div className="p-2">
                <h5 className="my-3">Sub-parameters and Scores for each package</h5>
                {data.map((item: any, index: number) => {
                    return (
                        <div className="text-light col-12 border border-light">
                            <button className="text-light p-2 col-12 bg-dark border border-dark " onClick={() => handleClick(index)}>
                                <h5 style={{
                                    textTransform: "uppercase",
                                }}>{item.PkgName}</h5>
                            </button>
                            {open === index && 
                                <div className="border border-dark">
                                <ul className="text-light">
                                    <li className="text-start">Age of Repo: {item.age_of_repo}</li>
                                    {
                                        item.age_of_repo == 1 ? 
                                        <p className="text-start m-0">{"("}The repository is more than 6 months old{")"}</p> :
                                        <p className="text-start m-0">{"("}The repository is less than 6 months old{")"}</p>
                                    }
                                    <li className="text-start">Contributors: {item.contributors>=10 ? 10 : item.contributors}/10</li>
                                    <li className="text-start">Dependents: {item.dependents}</li>
            
                                    <li className="text-start">Multiple Versions : <span className="text-success check-mark">{item.mutliple_versions==1 ? "\u2713": "\u274c"}</span></li>
                                    <li className="text-start">README: <span className="text-success" style={{
                                        fontWeight: "bold",
                                    }}>{item.readme==1 ? "\u2713" : "\u274c"}</span></li>
                                    <li className="text-start">Any Recent Releases : <span className="text-success" style={{
                                        fontWeight: "bold",
                                    }}>{item.recent_releases==1 ? "\u2713" : "\u274c"}</span></li>
                                    <li className="text-start">Stars and Forks: {item.stars_and_forks}</li>
                                </ul>
                            </div>
                            }
                        </div>
                        
                    );    
                })}

            </div>
        </div>
    );
}

export default CommunityRenderaComponent;