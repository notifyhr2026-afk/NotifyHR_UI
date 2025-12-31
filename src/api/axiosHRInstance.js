import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosHRInstance = axios.create({
    baseURL: apiConfig.HRserviceURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosHRInstance;