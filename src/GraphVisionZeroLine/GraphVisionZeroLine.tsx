import React from 'react';
import Dataset from '../classes/Dataset';

export interface GraphVisionZeroLineProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
}

export default class GraphVisionZeroLine extends React.Component<GraphVisionZeroLineProps> {

  componentDidUpdate(prevProps: GraphVisionZeroLineProps): void {
    const {forceUpdate} = this.props;
    if (forceUpdate !== prevProps.forceUpdate) this.setState({});
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-vision-zero-line">
        GRAPH VISION ZERO LINE COMPONENT
      </div>
    );
  }
}
