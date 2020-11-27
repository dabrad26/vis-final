/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as d3 from 'd3';
import Dataset from '../classes/Dataset';

export interface GraphVisionZeroLineProps {
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

export default class GraphVisionZeroLine extends React.Component<GraphVisionZeroLineProps> {
  sizing = {
    height: 500,
    margin: 150,
  };

  textStyle = {
    color: '#292929',
    size: '16px',
  };

  sortDates = (a: {date: Date}, b: {date: Date}): number => {
    return b.date.getTime() - a.date.getTime();
  }

  getTotalByMonth(data: Dataset[]): {total: number; date: Date}[] {
    const dayMap: Map<string, {total: number; date: Date}> = new Map();

    data.forEach(d => {
      const month = new Date(d.dateObject.getFullYear(), d.dateObject.getMonth(), 1);
      const key = `${d.dateObject.getFullYear()}-${d.dateObject.getMonth()}`;
      const foundItem = dayMap.get(key);
      if (foundItem) {
        foundItem.total++;
      } else {
        const newItem = {
          total: 1,
          date: month,
        };
        dayMap.set(key, newItem);
      }
    });

    return Array.from(dayMap.values()).sort(this.sortDates);
  }

  setupDom(): void {
    const {width, nycData, chicagoData, laData} = this.props;

    const dataNYC = this.getTotalByMonth(nycData);
    const dataChicago = this.getTotalByMonth(chicagoData);
    const dataLa = this.getTotalByMonth(laData);

    const domWrapper = document.querySelector('.graph-time-vision-zero-line .graph-area');
    if (domWrapper) {
      while (domWrapper.firstChild) {
        domWrapper.removeChild(domWrapper.firstChild);
      }
    }

    const xScale = d3.scaleTime()
      .domain(d3.extent([...dataNYC, ...dataChicago, ...dataLa].sort(this.sortDates), d => d.date) as any)
      .range([0, width - this.sizing.margin]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max([d3.max(dataNYC, d => +d.total), d3.max(dataChicago, d => +d.total), d3.max(dataLa, d => +d.total)] as any)] as any)
      .range([this.sizing.height - this.sizing.margin, 0]);

    const svgElement = d3
      .select('.graph-time-vision-zero-line .graph-area')
      .append('svg')
      .attr('width', `${width}px`)
      .attr('height', `${this.sizing.height}px`);

    const svgGroup = svgElement.append('g')
      .attr('transform', `translate(${this.sizing.margin / 2}, ${this.sizing.margin / 2})`);

    svgGroup.append('path')
      .datum(dataNYC)
      .attr('fill', 'none')
      .attr('stroke', '#10377b')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line().x((d: any) => xScale(d.date)).y((d: any) => yScale(d.total)) as any);

    svgGroup.append('path')
      .datum(dataChicago)
      .attr('fill', 'none')
      .attr('stroke', '#e32f22')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line().x((d: any) => xScale(d.date)).y((d: any) => yScale(d.total)) as any);

    svgGroup.append('path')
      .datum(dataLa)
      .attr('fill', 'none')
      .attr('stroke', '#f5bd41')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line().x((d: any) => xScale(d.date)).y((d: any) => yScale(d.total)) as any);

    svgGroup.append('g')
      .attr('transform', `translate(0, ${this.sizing.height - this.sizing.margin})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('y', 50)
      .attr('x', (width - this.sizing.margin) / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', this.textStyle.size)
      .attr('fill', this.textStyle.color)
      .text('Time of Day');

    svgGroup.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}`).ticks(8))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -(this.sizing.height / 3))
      .attr('text-anchor', 'middle')
      .attr('font-size', this.textStyle.size)
      .attr('fill', this.textStyle.color)
      .text('Total');
  }

  componentDidUpdate(prevProps: GraphVisionZeroLineProps): void {
    const {forceUpdate, width} = this.props;
    if (forceUpdate !== prevProps.forceUpdate || width !== prevProps.width) this.setupDom();
  }

  componentDidMount(): void {
    this.setupDom();
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-time-vision-zero-line">
        <div className="graph-area"></div>
      </div>
    );
  }
}
