import React, { useState } from "react";

const PackageRenderComponent = (props: any) => {

    const [open, setOpen] = useState(-1);

    const data = props.data.vpkg;

    const handleClick = (index: number) => {
        if (open === index) {
            setOpen(-1);
            return;
        }
        setOpen(index);
    }

    return (
        // Rendered when the user clicks on the Package Vulnerability and Security parameter
        <div className="p-2 mt-3" style={{
            overflow: "hidden",
        }}>
            <h4 className="text-light mt-3 mb-4">Package Vulnerability and Security</h4>
            {/* Create an unordered list */}
            {data.map((item: any, index: number) => {
                return (
                    <div className="border border-light">
                        <button className="text-light p-1 col-12 bg-dark border border-dark" onClick={() => handleClick(index)}>
                                <div className="d-flex align-items-center justify-content-between">
                                    <p className="text-start m-0" style={{
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                    }}>{item.package_name}</p>
                                    <p className="text-end m-0" style={{
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                    }}>{item.CVE}</p>
                                </div>
                        </button>
                        {open === index &&
                            <div className="border border-dark p-1 text-light">
                                <p className="text-start Adivsory" style={{
                                    overflow: "hidden",
                                }}>{item.advisory}</p>
                            </div>
                        }
                    </div>

                );
            })}
        </div>
    );
};

export default PackageRenderComponent;