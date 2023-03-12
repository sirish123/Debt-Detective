import React, { useState } from "react";

const PackageRenderComponent = (props: any) => {
    return (
        <div className="p-2 mt-3">
            <h4 className="text-light mt-3 mb-4">Package Vulnerability and Security</h4>
            {props.data.vpkg.map((item: any) => {
                return (
                    <div className="border border-white text-light m-2 p-2">
                        <div className="row">
                            <h5 className="text-start col-6">{item.package_name}</h5>
                            <h5 className="text-end col-6">{item.CVE}</h5>
                        </div>
                        <p className="text-start Adivsory">{item.advisory}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default PackageRenderComponent;