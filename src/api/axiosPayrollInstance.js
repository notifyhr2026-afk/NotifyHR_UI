import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosPayrollInstance = axios.create({
    baseURL: apiConfig.PayrollserviceURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosPayrollInstance;