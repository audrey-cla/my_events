import React, { Component } from 'react';
import { Route, Switch, Redirect, Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar'
const API_KEY = "wTKnV9FgbFjKzHMS"
const API_BASE = 'http://api.eventful.com/'
const API_URL = API_BASE + 'json/events/search?'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myEvent: [],
            categories: [],
            categorie: '',
            not_found: false,
            logged: false,
            location: ''
        };
        this.Navbarconnexion = React.createRef();
        const Navbarconnexion = this.Navbarconnexion.current;
        console.log(Navbarconnexion);
    }

    componentDidMount() {
        this.getThings();
    }

    getThings() {
        const that = this;
        axios.get(`https://cors-anywhere.herokuapp.com/http://api.eventful.com/rest/categories/list?app_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/xml; charset=utf-8"
            }
        }).then(categories => {
            var xml2js = require('xml2js');
            let parser = new xml2js.Parser();
            parser.parseString(categories.data,
                function (err, result) {
                    that.setState({ categories: result.categories.category })
                }
            );
        });

        navigator.geolocation.getCurrentPosition(position => {

            function getQueryStringValue(key) {
                return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
            }

            var location = '';
            if (getQueryStringValue("location")) {
                location = getQueryStringValue("location");
            } else {
                location = position.coords.latitude + "," + position.coords.longitude
            }

            axios.get(`${PROXY_URL + API_URL}app_key=${API_KEY}&category=${this.state.categorie}&where=${location}&within=50}}`, {
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            }).then(events => {
                if (events.data.events == null) {
                    this.setState({
                        not_found: true
                    })
                } else {
                    this.setState({
                        myEvent: events.data.events.event,
                        not_found: false
                    })

                    console.log(this.state.myEvent)
                }
            });


        });

    }

    handleChangeCat(e) {
        this.setState({ categorie: e })
        this.getThings();
    }

    handleSubmit(event) {
    }

    render() {

        return (
            <div>
                <Navbar ref={this.Navbarconnexion} />
                <div className="container-fluid h-100 m-0 p-0">
                    <div className="row h-100 m-0 p-0" id='container'>
                        <div className="p-2" id='menu'>
                            <select id="categorie_select" className="form-control" onChange={e => this.handleChangeCat(e.target.value)}>
                                <option value=''>Choose a categorie</option>
                                {this.state.categories.map((e) => {
                                    return (
                                        <option value={e.id}>{e.name.toString().replace('&amp;', '&')}</option>
                                    )
                                })}
                            </select>
                            <form onSubmit={this.handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="location">lieux</label>
                                    <input type="text" className="form-control" id="location" name="location" />
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                        <div className="p-2" id='event-container'>
                            <h2>Evenement a venir</h2>
                            {this.state.not_found == true ? "Aucun Évenement ne convient a votre recherche" :
                                this.state.myEvent.map((e) => {
                                    var imgUrl = e.image == null ? 'https://i.ebayimg.com/images/g/TakAAOSwA5RePEp-/s-l300.jpg' : 'http:' + e.image.medium.url;
                                    var divStyle = {
                                        backgroundImage: 'url(' + imgUrl + ')',
                                        backgroundSize: 'cover'
                                    }
                                    return (
                                        <div className="col-11 m-3 bg-warning">
                                            <div className="d-flex flex-row">
                                                <div className="p-2"><div className="img-home-affiche" style={divStyle}></div></div>
                                                <div className="p-2 test" >  <h3>{e.title}</h3>
                                                    <p> Au {e.venue_name}<br />{e.venue_address} {e.city_name}</p>
                                                    <br /><a href={"/event/" + e.id}>En savoir plus </a>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <Switch>

                </Switch>
            </div >
        )
    }
}

export default Home;