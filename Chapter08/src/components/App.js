/* global Facebook  */

import React, { Component } from 'react';
import Profile from './Profile';
import FriendList from './FriendList';
import ErrMsg from './ErrMsg';
import config from '../../config';
import Spinner from './Spinner';
import Login from './Login';
import emitter from '../utils/emitter';
import { getData } from '../utils/util';
import jss from 'jss';

const { classes } = jss.createStyleSheet({
  wrapper: {
    display: 'flex'
  },
  '@media (max-width: 1050px)': {
    wrapper: {
      'flex-wrap': 'wrap'
    }
  }
}).attach();

class App extends Component {

  state = {
    status: 'loading'
  };

  componentWillMount = () => {
    document.body.style.backgroundColor = '#ffffff';
  };

  componentWillUnmount = () => {
    emitter.removeListener('search');
  };

  componentDidMount = () => {
    emitter.on('search', query => this.setState({ query }));

    window.fbAsyncInit = () => {
      FB.init(config);

      // show login
      FB.getLoginStatus(
        response => response.status !== 'connected' && this.setState({ status: response.status })
      );

      FB.Event.subscribe('auth.authResponseChange', (response) => {
        // start spinner
        this.setState({ status: 'loading' });

        (async () => {
          try {
            const { profile, myFriends } = await getData();
            this.setState({ status: response.status, profile, myFriends });
          } catch (e) {
            this.setState({ status: 'err' });
          }
        })();
      });
    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      const js = d.createElement(s); js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  };

  _click = () => {
    FB.login(() => {}, { scope: ['user_posts', 'user_friends'] });
  };

  mainRender = () => {
    const { profile, myFriends, status, query } = this.state;
    if (status === 'err') {
      return (<ErrMsg />);
    } else if (status === 'unknown' || status === 'not_authorized') {
      return <Login fBLogin={this._click} />;
    } else if (status === 'connected') {
      return (
        <div className={classes.wrapper}>
          <Profile {...profile} />
          <FriendList myFriends={myFriends} query={query} />
        </div>
      );
    }
    return (<Spinner />);
  };

  render() {
    return (
      <div>
        {this.mainRender()}
      </div>
    );
  }

}

export default App;
