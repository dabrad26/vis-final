import React from 'react';
import Dataset from '../classes/Dataset';

export interface GraphTimeGraphicsProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
  /** Width to use for the graph */
  width: number;
}

export default class GraphTimeGraphics extends React.Component<GraphTimeGraphicsProps> {

  componentDidUpdate(prevProps: GraphTimeGraphicsProps): void {
    const {forceUpdate, width} = this.props;
    if (forceUpdate !== prevProps.forceUpdate || width !== prevProps.width) this.setState({});
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-time-graphics">
        GRAPH TIME GRAPHICS COMPONENT
      </div>
    );
  }
}