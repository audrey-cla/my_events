import React, { Component, useState } from 'react';
import { Route, Switch, Redirect, Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import FacebookLogin from 'react-facebook-login';
import {
    Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, NavLink, Alert
} from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const API_KEY = "wTKnV9FgbFjKzHMS"
const API_BASE = 'http://api.eventful.com/'
const API_URL = API_BASE + 'json/events/search?'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const config = {
    headers: {
        "Content-type": "application/json",
    }
}

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            myEvent: [],
            categories: [],
            categorie: '',
            not_found: false,
            logged: false,
            location: ''
        };
        this.baseState = this.state
        this.responseFacebook = this.responseFacebook.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this)
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        })
    }

    componentDidMount() {
        axios.get(`http://127.0.0.1:8000/api/checkuser/` + localStorage.getItem('fbid'), {
            method: 'GET',
            headers: {
                "Content-type": "application/json",
            }
        }).then(response => {
            if (response.data == '') {
            } else {
                this.setState({ name: response.data.Name, profile_pic: response.data.profilePic, facebookId: response.data.facebookId })
            }
        });
    }

    responseFacebook(response) {
        if (response.status == 'unknown') {
        }
        else {
            this.setState({ name: response.name, profile_pic: response.picture.data.url, facebookId: response.userID })
            axios.get(`http://127.0.0.1:8000/api/checkuser/` + response.userID, {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                }
            }).then(answer => {
                if (answer.data == '') {
                    this.toggle();
                }
                localStorage.setItem('fbid', response.userID);
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
        const body = {
            "Name": this.state.name,
            "profilePic": this.state.profile_pic,
            "username": this.state.username,
            "facebookId": this.state.facebookId,
            "bio": this.state.bio,
            "email": this.state.email,
        }
        axios.post("http://127.0.0.1:8000/api/user", body, config).then(res => {
            toast.success(res.data.message, { position: "top-center" });
            this.toggle();
        }).catch(err => {
            console.log(err);
        });
    }

    render() {
        var imgUrl = this.state.profile_pic ? this.state.profile_pic : null;
        var divStyle = {
            backgroundImage: 'url(' + imgUrl + ')'
        }
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Register!</ModalHeader>
                    <ModalBody>
                        {this.state.msg ? <Alert> {this.state.msg}</Alert> : null}
                        <Form onSubmit={this.handleRegisterSubmit}>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Type email"
                                    onChange={this.handleInputChange}
                                    required
                                />
                                <Label for="username">Username</Label>
                                <Input
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Type username"
                                    onChange={this.handleInputChange}
                                    required
                                />
                                <Label for="bio">Bio</Label>
                                <Input type="textarea" name="bio" id="bio" placeholder="Type Bio" onChange={this.handleInputChange} />
                                <Button color="dark" className="mt-4" block>
                                    Register
                                </Button>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                </Modal>

                <Link className={"navbar-brand"} to={"/"}> My_events </Link>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav mr-auto w-100 align-items-center justify-content-between">
                        <li className="nav-item d-flex justify-content-start">
                            {this.state.facebookId != null ? null : <FacebookLogin
                                appId="1260692110952329"
                                scope="public_profile, email"
                                fields="name,email,picture"
                                callback={this.responseFacebook}
                            />}
                        </li>
                        <li className="nav-item d-flex justify-content-start">{this.state.name != null ? <h3 className={"navbar-brand"}>{this.state.name}</h3> : null}
                            {this.state.profile_pic != null ?
                                <div className="profile_pic" style={divStyle}></div> : null}
                            {this.state.facebookId != null ? <a href="/yourprofil" className="m-2"> your profil </a> : null}
                            {this.state.facebookId != null ? <a href="#" className="m-2" onClick={(e) => { e.preventDefault(); window.FB.logout(); document.location.reload(true); localStorage.clear(); this.setState(this.baseState) }}> logout </a> : null}
                        </li>
                    </ul>
                </div>

            </nav>
        )
    }
}

export default Navbar;