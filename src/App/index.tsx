import './App.scss';
import React from 'react';

export default class App extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="main-layout">
        <h1>Title</h1>
        <p>Intro text</p>
        <h3>GRAPH Total accidents over time GRAPH</h3>
        <p>Summary of graph above</p>
        <h3>GRAPH Time based graphics GRAPH</h3>
        <p>Hypothesis on how time alters results</p>
        <h2>Vizion Zero</h2>
        <p>What is Vision Zero</p>
        <h3>GRAPH Vision zero laws and time GRAPH</h3>
        <h2>How New York City Compares to other Cities</h2>
        <p>Text about how other cities do it and their performance</p>
        <h3>GRAPH City comparison GRAPH</h3>
        <h2>Conclusion</h2>
        <p>Conclusion text</p>
      </div>
    );
  }
}
