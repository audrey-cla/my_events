import React, { Component } from 'react';
import { Route, Switch, Redirect, Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import Navbar from '../Navbar'
import {
    Button, Form, FormGroup, Label, Input, NavLink, Alert
} from 'reactstrap'


const API_KEY = "wTKnV9FgbFjKzHMS"
const API_BASE = 'http://api.eventful.com/'
const API_URL = API_BASE + 'json/events/search?'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const config = {
    headers: {
        "Content-type": "application/json",
    }
}

class EditProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sorties: [],
            email: '',
            name: '',
            profile_pic: '',
            username: '',
            facebookId: '',
            bio: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this)
    }

    componentDidMount() {
        axios.get(`http://127.0.0.1:8000/api/checkuser/` + localStorage.getItem('fbid'), {
            method: 'GET',
            headers: {
                "Content-type": "application/json",
            }
        }).then(response => {
            this.setState({ id: response.data.id, name: response.data.Name, bio: response.data.bio, profile_pic: response.data.profilePic, facebookId: response.data.facebookId, username: response.data.username, email: response.data.email })
            axios.get(`http://127.0.0.1:8000/api/checklessorties/` + response.data.id, {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                }
            }).then(answer => {
                this.setState({ sorties: answer.data })
                console.log(this.state.sorties)

            });

        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleUpdateSubmit(event) {
        event.preventDefault();
        alert('update');
        const body = {
            "Name": this.state.name,
            "profilePic": this.state.profile_pic,
            "username": this.state.username,
            "facebookId": this.state.facebookId.toString(),
            "bio": this.state.bio,
            "email": this.state.email,
        }
        axios.put("http://127.0.0.1:8000/api/user/" + this.state.id, body, config).then(res => {
            toast.success(res.data.message, { position: "top-center" });
            this.toggle();
        }).catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
                <Navbar />
                <h2>Edit your profile</h2>
                <Form onSubmit={this.handleUpdateSubmit}>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            value={this.state.name}
                            placeholder="Type name"
                            onChange={this.handleInputChange}
                            required
                        />
                        <Label for="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={this.state.email}
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
                            value={this.state.username}
                            placeholder="Type username"
                            onChange={this.handleInputChange}
                            required
                        />
                        <Label for="bio">Bio</Label>
                        <Input type="textarea" name="bio" value={this.state.bio} id="bio" placeholder="Type Bio" onChange={this.handleInputChange} />
                        <Button color="dark" className="mt-4" block>
                            Update
                                </Button>
                    </FormGroup>
                </Form>
                <h2>Liste des sorties</h2>
                {this.state.sorties ?
                    this.state.sorties.map((e) => {
                        return (
                            <div className="col-11 m-3 bg-warning">
                                <div className="d-flex flex-row">
                                    <div className="p-2"></div>
                                    <div className="p-2 test" >  <h3>{e.Nom}</h3>
                                        <p> nombres d'invités: {e.guests.length}</p>
                                        <br /><a href={"/event/" + e.id}>En savoir plus </a>
                                    </div>
                                </div>
                            </div>
                        )

                    })
                    : 'na'}


            </div >
        )
    }
}

export default EditProfile;