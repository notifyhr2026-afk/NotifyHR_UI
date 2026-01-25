// const apiConfig = {
//     IdentityURL: 'http://192.168.1.10:36522/api',
//     HRserviceURL: 'http://192.168.1.10:36523/api',
//     AttendanceserviceURL: 'http://192.168.1.10:36524/api',
//     RecruitmentserviceURL: 'http://192.168.1.10:36525/api'
// };

// const apiConfig = {
//     baseURL: 'http://115.98.2.37:36522/api',
//     HRserviceURL: 'http://115.98.2.37:36523/api',
//     AttendanceserviceURL: 'http://115.98.2.37:36524/api',
//     RecruitmentserviceURL: 'http://115.98.2.37:36525/api'
// };

const apiConfig = {
  IdentityURL: process.env.REACT_APP_IDENTITY_API_URL,
  HRserviceURL: process.env.REACT_APP_HR_API_URL,
  AttendanceserviceURL: process.env.REACT_APP_ATTENDANCE_API_URL,
  RecruitmentserviceURL: process.env.REACT_APP_RECRUITMENT_API_URL,
};

// const apiConfig = {
//     IdentityURL: 'http://localhost:36522/api',
//     HRserviceURL: 'http://localhost:36523/api',
//     AttendanceserviceURL: 'http://localhost:36524/api',
//     RecruitmentserviceURL: 'http://localhost:36525/api'
// };

export default apiConfig;