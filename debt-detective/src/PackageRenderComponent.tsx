import React, { useState } from "react";

const PackageRenderComponent = (props: any) => {
    return (
        // Rendered when the user clicks on the Package Vulnerability and Security parameter
        <div className="p-2 mt-3" style={{
            overflow: "hidden",
        }}>
            <h4 className="text-light mt-3 mb-4">Package Vulnerability and Security</h4>
            {/* Create an unordered list */}
            <div className="p-2 border border-light">
                <h5>Sub-parameters and Scores</h5>
                <div className="">
                    <ul className="text-light">
                        <li className="text-start">Age of Repo: {props.data.community_subparameters.age_of_repo}</li>
                        {
                            props.data.community_subparameters.age_of_repo == 1 ? 
                            <p className="text-start m-0">{"("}The repository is more than 6 months old{")"}</p> :
                            <p className="text-start m-0">{"("}The repository is less than 6 months old{")"}</p>
                        }
                        <li className="text-start">Contributors: {props.data.community_subparameters.contributors>=10 ? 10 : props.data.community_subparameters.contributors}/10</li>
                        <li className="text-start">Dependents: {props.data.community_subparameters.dependents}</li>

                        <li className="text-start">Multiple Versions : <span className="text-success check-mark">{props.data.community_subparameters.mutliple_versions==1 ? "\u2713": "\u274c"}</span></li>
                        <li className="text-start">README: <span className="text-success" style={{
                            fontWeight: "bold",
                        }}>{props.data.community_subparameters.readme==1 ? "\u2713" : "\u274c"}</span></li>
                        <li className="text-start">Any Recent Releases : <span className="text-success" style={{
                            fontWeight: "bold",
                        }}>{props.data.community_subparameters.recent_releases==1 ? "\u2713" : "\u274c"}</span></li>
                        <li className="text-start">Stars and Forks: {props.data.community_subparameters.stars_and_forks}</li>
                    </ul>
                </div>
            </div>
            <h5 className="mt-4 mb-2">Elaboration on Vulnerabilities</h5>
            {props.data.vpkg.map((item: any) => {
                return (
                    <div className="border border-white text-light m-2 p-2">
                        <div className="row">
                            <h5 className="text-start col-6">{item.package_name}</h5>
                            <h5 className="text-end col-6">{item.CVE}</h5>
                        </div>
                        <p className="text-start Adivsory" style={{
                            overflow: "hidden",
                        }}>{item.advisory}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default PackageRenderComponent;