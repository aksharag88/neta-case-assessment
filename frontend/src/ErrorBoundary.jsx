//this file is responsible for catching any errors while react is rendering. i kept running into errors with files
// not being uploaded and it would just generate a blank screen. this file made it so that it could actually see what
// was going wrong so i could debug it that way!

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  //updates state if a component fails so that it doesn't just show a blank screen
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  //logging
  componentDidCatch(error, info) {
    console.error("React Error caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <h3>Something went wrong rendering the page</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
