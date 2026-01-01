import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosRecruitmentInstance = axios.create({
    baseURL: apiConfig.RecruitmentserviceURL,
    headers:{
        'Content-Type': 'application/json',
    }
});

export default axiosRecruitmentInstance;