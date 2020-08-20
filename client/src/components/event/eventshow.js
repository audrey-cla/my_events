import React, { Component } from 'react';
import { Route, Switch, Redirect, Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import FacebookLogin from 'react-facebook-login';
import Navbar from '../Navbar'
import { ToastContainer, toast } from 'react-toastify';
import CheckUser from '../Userprofile'
import {
    Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, NavLink, Alert
} from 'reactstrap'

const API_KEY = "wTKnV9FgbFjKzHMS"
const API_BASE = 'http://api.eventful.com/'
const API_URL = API_BASE + 'json/events/get?'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const config = {
    headers: {
        "Content-type": "application/json",
    }
}
class EventShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myEvent: [],
            categorie: '',
            not_found: false,
            logged: false,
            email: '',
            name: '',
            profile_pic: '',
            username: '',
            facebookId: '',
            bio: '',
        };

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this)
    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        })
    }

    componentDidMount() {
        console.log(this.state)
        var pathArray = window.location.pathname.split('/');
        var eventID = pathArray[2];
        axios.get(`${PROXY_URL + API_URL}app_key=${API_KEY}&id=${eventID}}`, {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }
        }).then(events => {
            console.log(events)
            if (events.data.status) {
                this.setState({
                    not_found: true
                })
            } else {
                this.setState({
                    myEvent: events.data
                })
            }
        });

        if (localStorage.getItem('fbid')) {
            axios.get(`http://127.0.0.1:8000/api/checkuser/` + localStorage.getItem('fbid'), {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                }
            }).then(response => {
                console.log(response.data)
                this.setState({ logged: true, id: response.data.id, name: response.data.Name, bio: response.data.bio, profile_pic: response.data.profilePic, facebookId: response.data.facebookId, username: response.data.username, email: response.data.email })
            });
        }

    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleRegisterSubmit(event) {
        event.preventDefault();
        const array_guests = this.state.guests.split(',');
        const isPublic = this.state.Ispublic == "true" ? true : false;
        array_guests.push(this.state.username);
        const body = {
            "eventfulId": this.state.myEvent.id,
            "userId": this.state.id,
            "isPublic": isPublic,
            "guests": array_guests,
            "nom": this.state.myEvent.title,
        }
        axios.post("http://127.0.0.1:8000/api/sortie", body, config).then(res => {
            toast.success(res.data.message, { position: "top-center" });
            this.toggle();
        }).catch(err => {
            console.log(err);
        });
    }
    render() {

        function getDate(date) {
            let d = new Date(date);
            return "le " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + "à " + d.getHours() + "h" + (d.getMinutes() == 0 ? '' : d.getMinutes());
        }

        var e = this.state.myEvent;
        // var imgUrl = this.state.myEvent.images == null ? 'https://i.ebayimg.com/images/g/TakAAOSwA5RePEp-/s-l300.jpg' : 'http:' + this.state.myEvent.images.image.medium.url;
        var imgUrl = 'https://i.ebayimg.com/images/g/TakAAOSwA5RePEp-/s-l300.jpg';
        var divStyle = {
            backgroundImage: 'url(' + imgUrl + ')',
            backgroundSize: 'cover'
        }
        if (this.state.not_found == true) {
            return (<div>
                <Navbar />
                <div className="container-fluid h-100 m-0 p-0">
                    Aucun Évenement ne convient a votre recherche
                </div>
                <Switch>
                </Switch>
            </div >
            )
        }
        else {
            return (
                <div>
                    <Navbar />
                    <Modal isOpen={this.state.modal} toggle={this.toggle}>
                        <ModalHeader toggle={this.toggle}>Register!</ModalHeader>
                        <ModalBody>
                            {this.state.msg ? <Alert> {this.state.msg}</Alert> : null}
                            <Form onSubmit={this.handleRegisterSubmit}>
                                <div >Is this event public ?</div>
                                <div className="ml-4">
                                    <br /><Label for="Ispublic">
                                        <Input value={true}
                                            type="radio"
                                            name="Ispublic"
                                            onChange={this.handleInputChange}
                                        />Yes</Label>
                                    <br /><Label for="Ispublic">
                                        <Input value={false}
                                            type="radio"
                                            name="Ispublic"
                                            onChange={this.handleInputChange}
                                        />No</Label>
                                    <br /></div>
                                <Label for="guests">Guests</Label>
                                <Input type="textarea" name="guests" id="guests" placeholder="Type Users" onChange={this.handleInputChange} />

                                <Button color="dark" className="mt-4" block>
                                    Register
                                </Button>
                            </Form>
                        </ModalBody>
                    </Modal>

                    <div className="container-fluid h-100 m-0 p-0">
                        <div className="col-11 m-3 bg-warning">
                            <div className="d-flex flex-row">
                                <div className="p-2"><div className="img-home-affiche" style={divStyle}></div></div>
                                <div className="p-2 test" >  <h3>{e.title}</h3>
                                    <p> Au {e.venue_name}<br />{e.address}
                                        <br />{e.city}  {e.country}</p>
                                    {getDate(e.start_time)}

                                    {this.state.logged == true ? <Button onClick={this.toggle} color="dark" className="" block>
                                        Creer une sortie
                                </Button> : 'false'}
                                </div>
                            </div>
                            <h4>description event</h4>
                            <div dangerouslySetInnerHTML={{ __html: e.description }} />
                        </div>
                    </div>
                    <Switch>
                    </Switch>
                </div >
            )
        }
    }
}

export default EventShow;