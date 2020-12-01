/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as d3 from 'd3';
import Dataset from '../classes/Dataset';
import {Radio} from 'antd';

export interface GraphTimeStackedBarProps {
  /** Data to render */
  data: Dataset[];
  /** Indicator to update graph based on didUpdate (to avoid data check). */
  forceUpdate: number;
  /** Width to use for the graph */
  width: number;
}

export default class GraphTimeStackedBar extends React.Component<GraphTimeStackedBarProps> {
  twelveTime = true;
  formatNumber = (value: number): string => {
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  get xGroups(): {name: string; range: number[]}[] {
    return [
      {
        name: this.twelveTime ? '12am - 1am' : '0 - 1',
        range: [0, 1],
      },
      {
        name: this.twelveTime ? '2am - 3am' : '2 - 3',
        range: [2, 3],
      },
      {
        name: this.twelveTime ? '4am - 5am' : '4 - 5',
        range: [4, 5],
      },
      {
        name: this.twelveTime ? '6am - 7am' : '6 - 7',
        range: [6, 7],
      },
      {
        name: this.twelveTime ? '8am - 9am' : '8 - 9',
        range: [8, 9],
      },
      {
        name: this.twelveTime ? '10am - 11am' : '10 - 11',
        range: [10, 11],
      },
      {
        name: this.twelveTime ? '12pm - 1pm' : '12 - 13',
        range: [12, 13],
      },
      {
        name: this.twelveTime ? '2pm - 3pm' : '14 - 15',
        range: [14, 15],
      },
      {
        name: this.twelveTime ? '4pm - 5pm' : '16 - 17',
        range: [16, 17],
      },
      {
        name: this.twelveTime ? '6pm - 7pm' : '18 - 19',
        range: [18, 19],
      },
      {
        name: this.twelveTime ? '8pm - 9pm' : '20 - 21',
        range: [20, 21],
      },
      {
        name: this.twelveTime ? '10pm - 12am' : '22 - 0',
        range: [22, 24],
      },
    ];
  }

  sizing = {
    height: 500,
    margin: 150,
  };

  textStyle = {
    color: '#292929',
    size: '16px',
  };

  get dataByTime(): {name: string; total: number; ['Killed']: number; ['Injured']: number; ['Not hurt']: number}[] {
    const {data} = this.props;
    const timeGroups = this.xGroups;
    const groupMap: Map<string, {total: number; ['Killed']: number; ['Injured']: number; ['Not hurt']: number; range: number[]}> = new Map();
    timeGroups.forEach(group => {
      return groupMap.set(group.name, {total: 0, Killed: 0, Injured: 0, 'Not hurt': 0, range: group.range});
    });
    data.forEach(item => {
      const hour = Number(item.time.split(':')[0]);
      for (let i = 0; i < timeGroups.length; i++) {
        if (hour >= timeGroups[i].range[0] && hour <= timeGroups[i].range[1]) {
          const value = groupMap.get(timeGroups[i].name);
          if (value) {
            value.total++;
            if (item.injury === 'INJURED') value.Injured++;
            if (item.injury === 'KILLED') value.Killed++;
            if (item.injury === 'NONE') value['Not hurt']++;
          }
        }
      }
    });

    return Array.from(groupMap.entries()).map(time => {
      return {
        name: time[0],
        total: time[1].total,
        Killed: time[1].Killed,
        Injured: time[1].Injured,
        'Not hurt': time[1]['Not hurt'],
      };
    });
  }

  setupDom(): void {
    const {width} = this.props;
    const finalData = this.dataByTime;

    const domWrapper = document.querySelector('.graph-time-stacked-bar .graph-area');
    if (domWrapper) {
      while (domWrapper.firstChild) {
        domWrapper.removeChild(domWrapper.firstChild);
      }
    }

    const yScale = d3.scaleLinear()
      .range([this.sizing.height - this.sizing.margin, 0])
      .domain([0, d3.max(finalData, d => d.total) || 100]);

    const xScale = d3.scaleBand()
      .range([0, width - this.sizing.margin])
      .domain(finalData.map(d => d.name))
      .padding(0.2);

    const categories = ['Not hurt', 'Injured', 'Killed'];

    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(['#EF5C84', '#FFA500', '#800080']);

    const series = d3.stack().keys(categories)(finalData as any);

    const svgElement = d3
      .select('.graph-time-stacked-bar .graph-area')
      .append('svg')
      .attr('width', `${width}px`)
      .attr('height', `${this.sizing.height}px`);

    const svgGroup = svgElement.append('g')
      .attr('transform', `translate(${this.sizing.margin / 2}, ${this.sizing.margin / 2})`);

    const rects = svgGroup.selectAll('g')
      .data(series)
      .enter()
      .append('g')
      .attr('fill', d => color(d.key) as string);

    rects.selectAll('rect')
      .data((d: any) => d)
      .join('rect')
      .attr('x', (d: any) => xScale(d.data.name) || '')
      .attr('y', (d: any) => yScale(d[1]))
      .attr('height', (d: any) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .on('mouseover', (event, d: any) => {
        d3.select('#tooltip-wrapper')
          .transition()
          .duration(300)
          .style('opacity', 1)
          .style('left', `${event.pageX + 4}px`)
          .style('top', `${(event.pageY - window.scrollY) + 4}px`)
          .text(`Killed: ${this.formatNumber(d.data.Killed)}\nInjured: ${this.formatNumber(d.data.Injured)}\nNot hurt: ${this.formatNumber(d.data['Not hurt'])}`);
      })
      .on('mouseout', () => {
        d3.select('#tooltip-wrapper')
          .transition()
          .style('opacity', 0);
      })
      .on('mousemove', event => {
        d3.select('#tooltip-wrapper')
          .style('left', `${event.pageX + 4}px`)
          .style('top', `${(event.pageY - window.scrollY) + 4}px`);
      });

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
      .call(d3.axisLeft(yScale).tickFormat(d => `${this.formatNumber(d as number)}`).ticks(8))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -(this.sizing.height / 3))
      .attr('text-anchor', 'middle')
      .attr('font-size', this.textStyle.size)
      .attr('fill', this.textStyle.color)
      .text('Total');
  }

  get filters(): React.ReactNode {
    return (
      <Radio.Group
        value={this.twelveTime}
        onChange={event => {
          this.twelveTime = event.target.value;
          this.setupDom();
          this.setState({});
        }}
      >
        <Radio value={false}>24 Hour Time</Radio>
        <Radio value={true}>12 Hour Time</Radio>
      </Radio.Group>
    );
  }

  componentDidUpdate(prevProps: GraphTimeStackedBarProps): void {
    const {forceUpdate, width} = this.props;
    if (forceUpdate !== prevProps.forceUpdate || width !== prevProps.width) this.setupDom();
  }

  componentDidMount(): void {
    this.setupDom();
  }

  render(): React.ReactNode {
    return (
      <div className="graph-wrapper graph-time-stacked-bar">
        <div className="graph-area"></div>
        <div className="graph-specific-filters">{this.filters}</div>
      </div>
    );
  }
}
