import React, { Component } from "react";
import indexRoutes from "./routes";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

export default class MainApp extends Component {
  render() {
    return (
      <Router basename="/">
        <Switch>
        {indexRoutes.map((prop, key) => {
          return <Route path={prop.path} key={key} component={prop.component} />;
        })}
        </Switch>
      </Router>
    );
  }
}


