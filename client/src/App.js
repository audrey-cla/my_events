import React from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Home from './components/home/home';
import YourProfil from './components/user/yourprofil';
import EventShow from './components/event/eventshow';

class App extends React.Component {

    render() {
        // console.log(store.getState().auth);
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/event/:id" component={EventShow} />
                    <Route exact path="/yourprofil" component={YourProfil} />
                </Switch>
            </Router>
        )
    }
}

export default App;