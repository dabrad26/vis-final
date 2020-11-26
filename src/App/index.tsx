import './App.scss';
import React from 'react';
import {Button, Drawer, Result, Spin} from 'antd';
import * as d3 from 'd3';
import Dataset from '../classes/Dataset';
import Filter, {FilterSettings} from '../Filter/Filter';
import GraphTimeStackedBar from '../GraphTimeStackedBar/GraphTimeStackedBar';
import GraphTimeGraphics from '../GraphTimeGraphics/GraphTimeGraphics';
import GraphVisionZeroLine from '../GraphVisionZeroLine/GraphVisionZeroLine';
import GraphCityCompare from '../GraphCityCompare/GraphCityCompare';

export default class App extends React.Component {
  state = {
    loading: true,
    error: false,
    forceGraphUpdate: 0,
  }

  dataSets: {nyc: Dataset[]; chicago: Dataset[]; losAngeles: Dataset[]} = {
    nyc: [],
    chicago: [],
    losAngeles: [],
  };

  filterSetttings: FilterSettings = {
    status: ['KILLED', 'INJURED', 'NONE'],
    age: ['[0]', '[1,2,3]', '[4,5,6]', '[7,8]', '[9,10,11]', '[12,13,14]', '[15,16,17,18]', '[19,20,21,22,23]', '[24,25,26,27,28,29,30]', '[31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]', '[46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]', '[61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80]', '[81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102]'],
    city: ['nyc'],
  };

  filterChange = (newFilters: FilterSettings): void => {
    const {forceGraphUpdate} = this.state;
    this.filterSetttings = newFilters;
    this.setState({forceGraphUpdate: forceGraphUpdate + 1});
  }

  get loading(): React.ReactNode {
    return <Spin size="large" className="full-screen-loading" />;
  }

  get error(): React.ReactNode {
    return <Result
      status="error"
      title="Unable to load data"
      subTitle="The datasets could not be loaded. Please try reloading the page."
      extra={[
        <Button
          type="primary"
          key="reload"
          onClick={(): void => {
            window.location.reload();
          }}
        >
          Reload
        </Button>,
      ]}
    />;
  }

  get filterDrawer(): React.ReactNode {
    return (
      <Drawer title="Filters" width={380} closable={false} visible={true}>
        <Filter initialFilters={this.filterSetttings} onChange={this.filterChange} />
      </Drawer>
    );
  }

  componentDidMount(): void {
    window.addEventListener('resize', () => {
      const width = document.body.clientWidth;
      document.querySelector('body')?.classList[width < 1080 ? 'add' : 'remove']('mobile-styles');
    });

    d3.csv('/vis-final/data/nyc.csv').then((nycData: unknown[]) => {
      this.dataSets.nyc = nycData.map(data => new Dataset(data as Dataset));
      d3.csv('/vis-final/data/chicago.csv').then((chicagoData: unknown[]) => {
        this.dataSets.chicago = chicagoData.map(data => new Dataset(data as Dataset));
        d3.csv('/vis-final/data/los-angeles.csv').then((laData: unknown[]) => {
          this.dataSets.losAngeles = laData.map(data => new Dataset(data as Dataset));
          this.setState({loading: false});
        }).catch(error => {
          console.error('Unable to get data for Los Angeles', error);
          this.setState({loading: false, error: true});
        });
      }).catch(error => {
        console.error('Unable to get data for Chicago', error);
        this.setState({loading: false, error: true});
      });
    }).catch(error => {
      console.error('Unable to get data for NYC', error);
      this.setState({loading: false, error: true});
    });
  }

  get dataToUse(): Dataset[] {
    let data: Dataset[] = [];
    const validAges: number[] = [];
    this.filterSetttings.age.forEach(ageGroup => {
      const ages: number[] = JSON.parse(ageGroup);
      ages.forEach(age => {
        validAges.push(age);
      });
    });

    const filterData = (dataSet: Dataset[]): Dataset[] => {
      return dataSet.filter(item => {
        return (
          (validAges.indexOf(item.age) > -1) &&
          (this.filterSetttings.status.indexOf(item.injury) > -1)
        );
      });
    };

    this.filterSetttings.city.forEach((city) => {
      data = data.concat(filterData(this.dataSets[city as ('nyc'|'chicago'|'losAngeles')]));
    });

    return data;
  }

  get primaryContent(): React.ReactNode {
    const {forceGraphUpdate} = this.state;
    return (
      <div className="primary-content">
        <h1>Title</h1>
        <p>Intro text</p>
        <GraphTimeStackedBar data={this.dataToUse} forceUpdate={forceGraphUpdate} />
        <p>Summary of graph above</p>
        <GraphTimeGraphics data={this.dataToUse} forceUpdate={forceGraphUpdate} />
        <p>Hypothesis on how time alters results</p>
        <h2>Vizion Zero</h2>
        <p>What is Vision Zero</p>
        <GraphVisionZeroLine data={this.dataToUse} forceUpdate={forceGraphUpdate} />
        <h2>How New York City Compares to other Cities</h2>
        <p>Text about how other cities do it and their performance</p>
        <GraphCityCompare data={this.dataToUse} forceUpdate={forceGraphUpdate} />
        <h2>Conclusion</h2>
        <p>Conclusion text</p>
      </div>
    );
  }

  render(): React.ReactNode {
    const {loading, error} = this.state;

    if (error) {
      return this.error;
    } else if (loading) {
      return this.loading;
    } else {
      return (
        <div className="main-layout">
          {this.primaryContent}
          {this.filterDrawer}
        </div>
      );
    }

  }
}
