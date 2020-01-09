import React, {useState, useEffect} from 'react';
import axios from 'axios';

// This is one of our simplest components
// It doesn't have local state, so it can be a function component.
// It doesn't dispatch any redux actions or display any part of redux state
// or even care what the redux state is, so it doesn't need 'connect()'

const InfoPage = () => {

  const [item, setItem] = useState([]);
  useEffect(() => {
    axios.get(`/api/shelf`)
    .then(response => {
      setItem(response.data)
    })
    .catch( error => {
      console.log('getItems error:', error);
    })
  }, [])

  return(
    <div>
    <p>
      Shelf Page
    </p>
    <ul>
      {item.map(item => {
        return (<li key={item.id}><img src={item.image_url}/></li>)
      })}
    </ul>
  </div>
)};

export default InfoPage;