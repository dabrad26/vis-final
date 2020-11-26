import React from 'react';
import Dataset from '../classes/Dataset';

export interface GraphCityCompareProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
}

export default class GraphCityCompare extends React.Component<GraphCityCompareProps> {

  componentDidUpdate(prevProps: GraphCityCompareProps): void {
    const {forceUpdate} = this.props;
    if (forceUpdate !== prevProps.forceUpdate) this.setState({});
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-city-compare">
        GRAPH CITY COMPARE COMPONENT
      </div>
    );
  }
}
