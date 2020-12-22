import axios from 'axios';

export const api = axios.create(
    {
        baseURL: 'https://ecoleta-marketplace.herokuapp.com'
    }
);
