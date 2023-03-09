import React, { useState } from "react"

interface ParameterData {
    name: string;
    percent: string;
    knowmore: string;
};

const Parameter = (props: ParameterData) => {

    const [clicked, setClicked] = useState(false)

    return (
        <div className="row bg-dark p-2 Parameter-Box m-2 rounded">
            <p className="text-start text-light">{props.name}</p>
            <div className="mb-4 p-0 w-100 percentage-background">
                <p className="col-12 m-0 p-0 percentage-bar" style={{
                    width: props.percent
                }}>{props.percent}</p>
            </div>

            <div className="d-flex justify-content-start mb-2 p-0">
                <button className="btn btn-primary" onClick={() => {
                    setClicked(!clicked)
                }}>Know More</button>
            </div>
            {clicked ? <p className="bg-light text-start rounded p-1 mb-2">{props.knowmore}</p> : undefined}

        </div>
    );
};

export default Parameter;