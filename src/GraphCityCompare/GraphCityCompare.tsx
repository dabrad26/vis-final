/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as d3 from 'd3';
import Dataset from '../classes/Dataset';

export interface GraphCityCompareProps {
  /** Data for NYC to render */
  nycData: Dataset[];
  /** Data for Chicaco to render */
  chicagoData: Dataset[];
  /** Data for Los Angeles to render */
  laData: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
  /** Width to use for the graph */
  width: number;
}

export default class GraphCityCompare extends React.Component<GraphCityCompareProps> {
  sizing = {
    height: 500,
    margin: 150,
  };

  textStyle = {
    color: '#292929',
    size: '16px',
  };

  setupDom(): void {
    const {width, nycData, chicagoData, laData} = this.props;

    const finalData = [
      {
        name: 'Los Angeles',
        color: '#f5bd41',
        total: laData.filter(d => d.dateObject.getFullYear() >= 2016).length,
      },
      {
        name: 'Chicago',
        color: '#e32f22',
        total: chicagoData.filter(d => d.dateObject.getFullYear() >= 2016).length,
      },
      {
        name: 'New York City',
        color: '#10377b',
        total: nycData.filter(d => d.dateObject.getFullYear() >= 2016).length,
      },
    ];

    const domWrapper = document.querySelector('.graph-time-city-compare .graph-area');
    if (domWrapper) {
      while (domWrapper.firstChild) {
        domWrapper.removeChild(domWrapper.firstChild);
      }
    }

    const xScale = d3.scaleLinear()
      .range([0, width - this.sizing.margin])
      .domain([0, d3.max(finalData, d => d.total) || 10] as any);

    const yScale = d3.scaleBand()
      .range([(this.sizing.height - this.sizing.margin), 0])
      .padding(0.4)
      .domain(finalData.map(d => d.name));

    const svgElement = d3
      .select('.graph-time-city-compare .graph-area')
      .append('svg')
      .attr('width', `${width - 40}px`)
      .attr('height', `${this.sizing.height}px`);

    const svgGroup = svgElement.append('g')
      .attr('transform', `translate(${this.sizing.margin / 2}, ${this.sizing.margin / 2})`);

    svgGroup.selectAll('rect')
      .data(finalData)
      .enter().append('rect')
      .attr('fill', (d: any) => d.color)
      .attr('width', (d: any) => xScale(d.total))
      .attr('height', yScale.bandwidth())
      .attr('y', (d: any) => yScale(d.name) as any);

    svgGroup.append('g')
      .attr('transform', `translate(0, ${this.sizing.height - this.sizing.margin})`)
      .call(d3.axisBottom(xScale));

    svgGroup.append('g')
      .call(d3.axisLeft(yScale));
  }

  componentDidUpdate(prevProps: GraphCityCompareProps): void {
    const {forceUpdate, width} = this.props;
    if (forceUpdate !== prevProps.forceUpdate || width !== prevProps.width) this.setupDom();
  }

  componentDidMount(): void {
    this.setupDom();
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-time-city-compare">
        <div className="graph-area"></div>
      </div>
    );
  }
}
