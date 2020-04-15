import React,{Component} from 'react';
import { Provider } from "react-redux";
import { configureStore } from "./redux/store";

import MainApp from './meanApp';
class App extends Component{
    render(){
return(
    <Provider store={configureStore()}>
        <MainApp/>
    </Provider>
);}}

export default App;