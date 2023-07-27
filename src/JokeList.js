import React, { Component } from 'react';
import axios from 'axios';
import './JokeList.css';
import Joke from './Joke';
import {v4 as uuid} from 'uuid'

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };

    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
            loading: false
        }
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        console.log(this.seenJokes);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.getJokes();
        }
        
    }

    async getJokes() {
        try {
            let jokes = [];
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get('https://icanhazdadjoke.com', {
                    headers: {
                        Accept: 'application/JSON'
                    }
                });
                if(!this.seenJokes.has(res.data.joke)){
                    jokes.push({
                        text: res.data.joke,
                        votes: 0,
                        id: uuid()
                    });
                } 
            }
            this.setState(st => ({
                jokes: [...st.jokes, ...jokes],
                loading: false
            }),
                () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
            );
            window.localStorage.setItem('jokes', JSON.stringify(jokes));
        } catch(e) {
            alert(e);
            this.setState({
                loading: false
            })
        }
    }

    handleClick() {
        this.setState({
            loading: true
        }, this.getJokes);
    }

    handleVotes(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map( j => 
                j.id === id ? {...j, votes: j.votes + delta} : j
            )
        }),
        () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
        );
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='JokeList-spinner'>
                    <i className='far fa-8x fa-laugh fa-spin' />
                    <h1 className='JokeList-title'>Loading...</h1>
                </div>
            );
        }

        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);

        return(
            <div className='JokeList'>
                <div className='JokeList-sidebar'>
                    <h1 className='JokeList-title'>
                        <span>Dad</span> Jokes
                    </h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'/>
                    <button className='JokeList-getmore' onClick={this.handleClick}>New Jokes</button>
                </div>
                <div className='JokeList-jokes'>
                    {jokes.map(j => (
                        <Joke 
                        upvote={() => this.handleVotes(j.id, 1)} 
                        downvote={() => this.handleVotes(j.id, -1)} 
                        votes={j.votes} 
                        text={j.text} 
                        key={j.id}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default JokeList;