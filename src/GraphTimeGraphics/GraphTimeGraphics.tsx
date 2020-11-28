import React from 'react';
import './GraphTimeGraphics.scss';
import Dataset from '../classes/Dataset';
import sunrise_empty from '../svg/sunrise_empty.svg';
import sunrise_filled from '../svg/sunrise_filled.svg';
import day_empty from '../svg/day_empty.svg';
import day_filled from '../svg/day_filled.svg';
import evening_empty from '../svg/evening_empty.svg';
import evening_filled from '../svg/evening_filled.svg';
import night_empty from '../svg/night_empty.svg';
import night_filled from '../svg/night_filled.svg';

export interface GraphTimeGraphicsProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
  /** Width to use for the graph */
  width: number;
}

export type TimeGroups = 'morning'|'day'|'evening'|'night';

export default class GraphTimeGraphics extends React.Component<GraphTimeGraphicsProps> {
  timeGroups = {
    morning: [4, 5, 6, 7, 8, 9, 10],
    day: [11, 12, 13, 14, 15],
    evening: [16, 17, 18, 19, 20],
    night: [21, 22, 23, 0, 1, 2, 3],
  }

  parseData(): {morning: number; day: number; evening: number; night: number} {
    const {data} = this.props;
    const returnData = {
      morning: 0,
      day: 0,
      evening: 0,
      night: 0,
    };

    data.forEach(item => {
      const hour = Number(item.time.split(':')[0]);
      Object.keys(returnData).forEach((key) => {
        if (this.timeGroups[key as TimeGroups].indexOf(hour) > -1) returnData[key as TimeGroups]++;
      });
    });

    return {
      morning: data.length ? (returnData.morning / data.length) * 100 : 0,
      day: data.length ? (returnData.day / data.length) * 100 : 0,
      evening: data.length ? (returnData.evening / data.length) * 100 : 0,
      night: data.length ? (returnData.night / data.length) * 100 : 0,
    };

  }

  componentDidUpdate(prevProps: GraphTimeGraphicsProps): void {
    const {forceUpdate, width} = this.props;
    if (forceUpdate !== prevProps.forceUpdate || width !== prevProps.width) this.setState({});
  }

  render(): React.ReactNode {
    const finalData = this.parseData();
    return (
      <div className="graph-wrapper graph-time-graphics">
        <div className="graphic-wrapper">
          <div className="image-wrapper">
            <div className="overlay" style={{backgroundImage: `url(${sunrise_filled})`, width: `${finalData.morning}%`}}></div>
            <div className="background" style={{backgroundImage: `url(${sunrise_empty})`}}></div>
            <div className="text">Morning ({Math.round(finalData.morning)}%)</div>
          </div>
          <div className="image-wrapper">
            <div className="overlay" style={{backgroundImage: `url(${day_filled})`, width: `${finalData.day}%`}}></div>
            <div className="background" style={{backgroundImage: `url(${day_empty})`}}></div>
            <div className="text">Day ({Math.round(finalData.day)}%)</div>
          </div>
          <div className="image-wrapper">
            <div className="overlay" style={{backgroundImage: `url(${evening_filled})`, width: `${finalData.evening}%`}}></div>
            <div className="background" style={{backgroundImage: `url(${evening_empty})`}}></div>
            <div className="text">Evening ({Math.round(finalData.evening)}%)</div>
          </div>
          <div className="image-wrapper">
            <div className="overlay" style={{backgroundImage: `url(${night_filled})`, width: `${finalData.night}%`}}></div>
            <div className="background" style={{backgroundImage: `url(${night_empty})`}}></div>
            <div className="text">Night ({Math.round(finalData.night)}%)</div>
          </div>
        </div>
      </div>
    );
  }
}
