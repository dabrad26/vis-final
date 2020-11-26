import React from 'react';
import Dataset from '../classes/Dataset';

export interface GraphTimeStackedBarProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
}

export default class GraphTimeStackedBar extends React.Component<GraphTimeStackedBarProps> {

  componentDidUpdate(prevProps: GraphTimeStackedBarProps): void {
    const {forceUpdate} = this.props;
    if (forceUpdate !== prevProps.forceUpdate) this.setState({});
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-time-stacked-bar">
        GRAPH TIME STACKED BAR COMPONENT
      </div>
    );
  }
}
