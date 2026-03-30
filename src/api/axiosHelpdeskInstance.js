import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosHelpdeskInstance = axios.create({
    baseURL: apiConfig.HelpdeskserviceURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosHelpdeskInstance;