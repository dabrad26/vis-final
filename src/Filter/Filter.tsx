import './Filter.scss';
import React from 'react';
import {Checkbox, Divider, List} from 'antd';
import {CheckboxValueType} from 'antd/lib/checkbox/Group';

export interface FilterSettings {
  status: string[];
  age: string[];
  city: string[];
}

export interface FilterProps {
  /** onChange function to call whenever filters change */
  onChange: ((settings: FilterSettings) => void);
  /** Initial filters to set on init */
  initialFilters: FilterSettings;
}

export default class Filter extends React.Component<FilterProps> {
  state = {
    /** Default value does not update after render. So don't render until props are read in. */
    ready: false,
  }

  currentSetting: FilterSettings = {
    status: [],
    age: [],
    city: [],
  };

  dataSources = [
    {name: 'New York City Data Source', link: 'https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Person/f55k-p6yu'},
    {name: 'Los Angeles Data Source', link: 'https://data.lacity.org/A-Safe-City/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w'},
    {name: 'Chicago Data Source', link: 'https://data.cityofchicago.org/Transportation/Traffic-Crashes-People/u6pd-qa9d'},
    {name: 'New York City Vision Zero', link: 'https://www1.nyc.gov/content/visionzero/pages/'},
    {name: 'Los Angeles Vision Zero', link: 'https://pw.lacounty.gov/visionzero/'},
    {name: 'Chicago Vision Zero', link: 'https://www.chicago.gov/city/en/depts/cdot/supp_info/vision-zero-chicago.html'},
  ]

  cityOptions = [
    {label: 'New York City', value: 'nyc'},
    {label: 'Los Angeles, California', value: 'losAngeles'},
    {label: 'Chicago, Illinois', value: 'chicago'},
  ];

  statusOptions = [
    {label: 'Killed (including deceased from injuries)', value: 'KILLED'},
    {label: 'Injured (reported or visible)', value: 'INJURED'},
    {label: 'Not hurt (no report of injury)', value: 'NONE'},
  ];

  ageOptions = [
    {label: 'Unknown', value: '[0]'},
    {label: 'Toddler (1-3)', value: '[1,2,3]'},
    {label: 'Pre Schoolers (4-6)', value: '[4,5,6]'},
    {label: 'Primary Schoolers (7-8)', value: '[7,8]'},
    {label: 'Elementary Schoolers (9-11)', value: '[9,10,11]'},
    {label: 'Middle Schoolers (12-14)', value: '[12,13,14]'},
    {label: 'High Schoolers (15-18)', value: '[15,16,17,18]'},
    {label: 'College Age (19-23)', value: '[19,20,21,22,23]'},
    {label: 'Young Adult (24-30)', value: '[24,25,26,27,28,29,30]'},
    {label: 'Adult (31-45)', value: '[31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]'},
    {label: 'Middle Age (46-60)', value: '[46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]'},
    {label: 'Senior (61-80)', value: '[61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80]'},
    {label: 'Senior (81+)', value: '[81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102]'},
  ];

  onChange = (selected: CheckboxValueType[], group: 'status'|'age'|'city'): void => {
    const {onChange} = this.props;
    this.currentSetting[group] = selected as string[];
    onChange(this.currentSetting);
  }

  componentDidMount(): void {
    const {initialFilters} = this.props;
    this.currentSetting = initialFilters;
    this.setState({ready: true});
  }

  render(): React.ReactNode {
    const {ready} = this.state;
    return ready ? (
      <div className="filter-wrapper">
        <div className="label">Status of individual</div>
        <Checkbox.Group options={this.statusOptions} defaultValue={this.currentSetting.status} onChange={event => this.onChange(event, 'status')} />
        <div className="label">Age of individual</div>
        <Checkbox.Group options={this.ageOptions} defaultValue={this.currentSetting.age} onChange={event => this.onChange(event, 'age')} />
        <div className="label">Cities to include</div>
        <div className="helper-text">This study focuses on New York City, but for comparison other cities are available.</div>
        <Checkbox.Group options={this.cityOptions} defaultValue={this.currentSetting.city} onChange={event => this.onChange(event, 'city')} />
        <Divider />
        <div className="label">Data Sources and Citations</div>
        <List size="small" bordered={true} dataSource={this.dataSources} renderItem={(item: {name: string; link: string}) => <List.Item><a href={item.link} rel="noreferrer" target="_blank">{item.name}</a></List.Item>} />
      </div>
    ) : null;
  }
}
