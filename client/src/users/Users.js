import React from 'react';
import axios from 'axios';

class Users extends React.Component {
  state = {
    users: [],
  };

  render() {
    return (
      <>
        <h2>List of Users</h2>
        <ul>
          {this.state.users.map(u => (
            <li key={u.id}>{u.username}</li>
          ))}
        </ul>
      </>
    );
  }

  componentDidMount() {
    const reqOptions = {headers: {
      authorization: localStorage.getItem('jwt')
    }}
    axios.get('http://localhost:5000/api/users', reqOptions).then(res => {
      this.setState({ users: res.data.users });
    });
  }
}

export default Users;