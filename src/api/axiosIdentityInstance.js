import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosIdentityInstance = axios.create({
    baseURL: apiConfig.IdentityURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosIdentityInstance;