import React from "react";

/**
 *
 */
export default class Loader extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return (
            <div className="loader-overlay">
                <div className="loader">
                    <div className="fas fa-spin fa-spinner"></div>
                </div>
            </div>
        );
    }
}
