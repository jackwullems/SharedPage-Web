import React from "react";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, isLoading, ...props }) => {
  return <Route {...props} />;
};

export default PrivateRoute;
