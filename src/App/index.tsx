import './App.scss';
import React from 'react';
import {Button, Drawer, Result, Spin, List} from 'antd';
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
    width: 1100,
    graphLoading: false,
    filterOpen: false,
  }

  currentTimeout: ReturnType<typeof setTimeout>|undefined;
  resizeTimeout: ReturnType<typeof setTimeout>|undefined;

  dataSets: {nyc: Dataset[]; chicago: Dataset[]; losAngeles: Dataset[]} = {
    nyc: [],
    chicago: [],
    losAngeles: [],
  };

  filterSetttings: FilterSettings = {
    status: ['KILLED', 'INJURED', 'NONE'],
    age: ['[0]', '[1,2,3]', '[4,5,6]', '[7,8]', '[9,10,11]', '[12,13,14]', '[15,16,17,18]', '[19,20,21,22,23]', '[24,25,26,27,28,29,30]', '[31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]', '[46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]', '[61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80]', '[81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102]'],
    sex: ['M', 'F', 'X'],
    city: ['nyc'],
  };

  filterChange = (newFilters: FilterSettings): void => {
    const {forceGraphUpdate} = this.state;
    this.filterSetttings = newFilters;
    this.setState({graphLoading: true});
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.currentTimeout = setTimeout(() => {
      this.setState({forceGraphUpdate: forceGraphUpdate + 1, graphLoading: false});
      this.currentTimeout = undefined;
    }, 500);
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
    const {filterOpen} = this.state;
    return (
      <Drawer
        title="Filters"
        width={380}
        className={this.mobileVersion ? 'mobile-styles' : ''}
        closable={this.mobileVersion}
        visible={this.mobileVersion ? filterOpen : true}
        onClose={(): void => {
          if (this.mobileVersion) this.setState({filterOpen: false});
        }}
      >
        <Filter initialFilters={this.filterSetttings} onChange={this.filterChange} />
      </Drawer>
    );
  }

  componentWillUnmount(): void {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  componentDidMount(): void {
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.setState({width: document.body.clientWidth});
      }, 300);
    });

    d3.csv('/vis-final/data/nyc.csv').then((nycData: unknown[]) => {
      this.dataSets.nyc = nycData.map(data => new Dataset(data as Dataset));
      d3.csv('/vis-final/data/chicago.csv').then((chicagoData: unknown[]) => {
        this.dataSets.chicago = chicagoData.map(data => new Dataset(data as Dataset));
        d3.csv('/vis-final/data/los-angeles.csv').then((laData: unknown[]) => {
          this.dataSets.losAngeles = laData.map(data => new Dataset(data as Dataset));
          this.setState({loading: false, width: document.body.clientWidth});
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

  getDataToUse(specificCity?: 'nyc'|'chicago'|'losAngeles'): Dataset[] {
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
          (this.filterSetttings.status.indexOf(item.injury) > -1) &&
          (this.filterSetttings.sex.indexOf(item.sex) > -1)
        );
      });
    };

    if (specificCity) {
      data = data.concat(filterData(this.dataSets[specificCity]));
    } else {
      this.filterSetttings.city.forEach((city) => {
        data = data.concat(filterData(this.dataSets[city as ('nyc'|'chicago'|'losAngeles')]));
      });
    }

    return data;
  }

  get mobileVersion(): boolean {
    const {width} = this.state;
    return width < 1080;
  }

  get graphLoadingScreen(): React.ReactNode {
    return (
      <div className="loading-overlay">
        {this.loading}
      </div>
    );
  }

  get listOfVisionZeroChanges(): React.ReactNode {
    const data: string[] = [
      '21.4 miles of protected bile lanes installed',
      '2.3 million notices of liability issued by speed cameras',
      '120.3 miles of traffic signals retimed',
      '81,609 summonses issued to drivers for failure to yield',
      '79 left-turn calming treatments added',
      '36% decline in pedestrian deaths',
      '645 school zones protected by speed cameras',
    ];

    return (
      <List
        size="small"
        className="vision-zero-list"
        header={<b>Vision Zero Changes (as of 2020)</b>}
        footer={<i><a href="https://www1.nyc.gov/assets/visionzero/downloads/pdf/vision-zero-year-6-report.pdf" rel="noreferrer" target="_blank">Vision Zero: 6 Year Report (June 2020)</a></i>}
        bordered={true}
        dataSource={data}
        renderItem={item => <List.Item>{item}</List.Item>}
      />
    );
  }

  get primaryContent(): React.ReactNode {
    const {forceGraphUpdate, width, graphLoading} = this.state;
    const widthToUse = this.mobileVersion ? width : (width - (380 + 48));
    const allowNyc = this.filterSetttings.city.indexOf('nyc') > -1;
    const allowChicago = this.filterSetttings.city.indexOf('chicago') > -1;
    const allowLosAngeles = this.filterSetttings.city.indexOf('losAngeles') > -1;
    return (
      <div className="primary-content">
        {graphLoading && this.graphLoadingScreen}
        <h1>Pedestrian and Cyclist Accidents In New York City Compared to other Major Cities</h1>
        <p>Being a pedestrian and cyclist in New York City can be dangerous with the high population and number of vehicles on the road.  New York City has made several efforts to make the streets safer for all and this visualization hopes to explore how efforts to improve the city’s streets for non-automobiles has worked out and also evaluate the most dangerous times of the day for pedestrians and cyclist.  Filters on the right side of the page are available to fine tune the data for your specific case.  This allows you to find the safest time for biking to school or work based on your age group.  As well as filtering for killed, injured or accident but no injuries.  You can also include data from other major cities like Los Angeles or Chicago for comparative data.</p>
        <p>To start this evaluation, we will look at the times of the day and see which have the most accidents and explore the reasons.  The stacked bar graph below shows the total accidents for each time frame.</p>
        <GraphTimeStackedBar data={this.getDataToUse()} forceUpdate={forceGraphUpdate} width={widthToUse} />
        <p>Viewing the graph, we can see that the evening from 4-8 pm (16-20h) is the most dangerous time.  Accounting for nearly 35% of all accidents this has the most accidents.  The morning commute hours account for the second largest group of accidents.  Accidents during the commute hours make sense as they would have the most traffic of any part of the day; the range is larger but over the last 30 years the range of commute times has grown in New York City <a href="https://www.nytimes.com/1987/09/09/nyregion/new-york-rush-hours-grow-earlier-and-later.html" rel="noreferrer" target="_blank">(New York Times, 1987)</a>.  It is also important to consider the number of New York City residents. With over 8 million residents in the five boroughs of New York City <a href="https://www.nbcnewyork.com/news/local/new-york-city-historic-population-8-million-people-census/447194/" rel="noreferrer" target="_blank">(NBC New York, 2018)</a> it is the most populous city in the United States.</p>
        <br />
        <GraphTimeGraphics data={this.getDataToUse()} forceUpdate={forceGraphUpdate} width={widthToUse} />
        <p>Commute times cause the most accidents by statistics alone, but the blame usually falls on the drivers of automobiles.  Drivers usually driving too fast for the city’s 25 mph speed limit or attempting to dangerously pass cyclist or pedestrians.  Larger vehicles have also been a concern as more and more people drive trucks and SUVs that are more likely to cause serious damage if involved in a pedestrian accident.  The rise of delivery services has also increased the number of large trucks who also are frequently seen blocking bike paths and causing cyclist to enter into main traffic lanes.  The frightening increase in accidents have prompted the city to consider new ways to deal with the issue and looking to follow other cities who have created programs to focus on bringing down the number of accidents <a href="https://www.nytimes.com/2020/03/10/nyregion/nyc-deaths-pedestrian-cycling.html" rel="noreferrer" target="_blank">(New York Times, 2020)</a>. </p>
        <h2>Vizion Zero</h2>
        <p>Vision Zero is the philosophy that all deaths are preventable and has had great success in many European cities.  It has been adopted by several cities across the United States.  In 2014 New York City adopted it with the hopes to have a city with zero deaths from traffic accidents.  The plan focuses on improving infrastructure around the city to make it safer for pedestrians, including better crosswalks, divided bike trails from roadways and more accessible crosswalk systems.  The plan also raises penalties for drivers who violate the rules of the road or leave the scene of an accident and adds more traffic cameras to penalize drivers who violate the law and put the life of pedestrians and cyclist in danger.  The city also improved their own vehicles by adding cyclist guards to sides of large trucks, and prosecuting bus drivers as normal drivers if they cause an at-fault accident <a href="https://www1.nyc.gov/assets/visionzero/downloads/pdf/vision-zero-year-6-report.pdf" rel="noreferrer" target="_blank">(Vision Zero 6 Year Report, 2020)</a>.</p>
        {this.listOfVisionZeroChanges}
        <p>The graph below shows the total accidents based on current filters for New York City; or other cities if toggled in the filters.  New York City’s Open Data started logging the data in 2016 so unfortunately changes from the initial year of Vision Zero are not shown here.  March 2020 was the start of the stay-at-home orders due to the COVID-19 pandemic which shows a massive drop in accidents.</p>
        <GraphVisionZeroLine nycData={allowNyc ? this.getDataToUse('nyc') : []} chicagoData={allowChicago ? this.getDataToUse('chicago') : []} laData={allowLosAngeles ? this.getDataToUse('losAngeles') : []} forceUpdate={forceGraphUpdate} width={widthToUse} />
        <h2>How New York City Compares to other Cities</h2>
        <p>The graph above shows the number of accidents over the time, based on available public data.  The data shows not much change for pedestrians.  While New York City seems to state the success the numbers of pedestrian accidents have stayed relatively high.  The same pattern has been seen in other Vision Zero cities like Los Angeles <a href="https://www.latimes.com/california/story/2020-02-05/vision-zero-los-angeles-traffic-collisions-deaths-2019" rel="noreferrer" target="_blank">(Los Angeles Times, 2020)</a> and Chicago <a href="https://chi.streetsblog.org/2020/02/13/chicago-saw-a-20-drop-in-traffic-deaths-in-2019-but-little-decrease-in-ped-fatalities/" rel="noreferrer" target="_blank">(Streets Blog Chicago, 2020)</a> where pedestrian accidents have stayed stubbornly high.  From New York City police data most accidents are caused by the driver either from drivers not paying attention or failing to yield to pedestrians or cyclist <a href="https://www.nytimes.com/2020/03/10/nyregion/nyc-deaths-pedestrian-cycling.html" rel="noreferrer" target="_blank">(New York Time, 2020)</a>.   Unfortunately, this means the cities can improve the infrastructures of their city to protect pedestrians and cyclist and make it clearer for drivers but if the drivers do not stop or watch the road, they will still end up causing accidents.  New York City has focused in recent years on ticketing drivers more for accidents and violating traffic laws, which will probably be the most efficient way to handle the situation.  The bars below show the comparison of total accidents in each city.  The data only includes accidents after 2016 to match the available data from New York City and Chicago.  It important to note that Los Angeles has about half the population of New York City making the aggregated data by population very similar across the three cities.  However, the goal is to have zero deaths; meaning that New York City has a very long way to go.</p>
        <GraphCityCompare nycData={this.getDataToUse('nyc')} chicagoData={this.getDataToUse('chicago')} laData={this.getDataToUse('losAngeles')} forceUpdate={forceGraphUpdate} width={widthToUse} />
        <h2>Conclusion</h2>
        <p>The numbers presented here are saddening.  Many lives lost and impacted by drivers not paying attention or failure to yielding to others.  Vision Zero has a long way to go and from its initial plan of 10 years only has 4 years left to get to zero.  At the current pace it does not seem likely.  The data shows that no one group is affected more than the other and all young and old are involved in accidents with motor vehicles.  While in a few cases cyclists or pedestrians are at fault, however, most of the time it is distracted drivers.  I truly hope the city can become safer as we continue to improve infrastructure and provide more isolated places for pedestrians and cyclists and hopefully drivers will slow down and pay attention when driving to ensure that everyone can get home safely every day.</p>
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
        <div className={`main-layout ${this.mobileVersion ? 'mobile-styles' : ''}`}>
          {this.mobileVersion && (
            <div className="mobile-filter-toggle">
              <Button
                type="primary"
                onClick={(): void => {
                  this.setState({filterOpen: true});
                }}>View Filters</Button>
            </div>
          )}
          {this.primaryContent}
          {this.filterDrawer}
        </div>
      );
    }

  }
}
