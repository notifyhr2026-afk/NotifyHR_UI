import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosAttendanceInstance = axios.create({
    baseURL: apiConfig.AttendanceserviceURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosAttendanceInstance;