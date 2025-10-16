// ============================================
// API UTILITY FUNCTIONS (utils/api.ts)
// ============================================

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configure axios to include credentials (cookies) with every request
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    console.error('API Response Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION
// ============================================

export const checkAuth = async () => {
  return api.get('/check-cookie');
};

export const logout = async () => {
  return api.post('/logout');
};

// ============================================
// DEPARTMENTS
// ============================================

export const getAllDepartments = async () => {
  const response = await api.get('/department');
  return { data: response.data.departments };
};

export const createDepartment = async (departmentData: {
  name: string;
  description: string;
}) => {
  return api.post('/department', departmentData);
};

// ============================================
// STAFF
// ============================================

export const getAllStaff = async () => {
  return api.get('/staff');
};

export const createStaff = async (staffData: any) => {
  return api.post('/staff', staffData);
};

export const updateStaff = async (id: string, staffData: any) => {
  return api.put(`/staff/${id}`, staffData);
};

export const deleteStaff = async (id: string) => {
  return api.delete(`/staff/${id}`);
};

// ============================================
// SCHEDULES
// ============================================

export const getAllSchedules = async (params?: any) => {
  return api.get('/schedule', { params });
};

export const createSchedule = async (scheduleData: any) => {
  console.log('API: Creating schedule with data:', scheduleData);
  
  try {
    const response = await api.post('/schedule', scheduleData);
    console.log('API: Schedule created successfully:', response.data);
    return response;
  } catch (error: any) {
    console.error('API: Error creating schedule:', error);
    console.error('API: Error response:', error.response?.data);
    throw error;
  }
};

export const updateSchedule = async (id: string, scheduleData: any) => {
  return api.put(`/schedule/${id}`, scheduleData);
};

export const deleteSchedule = async (id: string) => {
  return api.delete(`/schedule/${id}`);
};

export const getAvailableStaff = async (params: any) => {
  return api.get('/schedule/available-staff', { params });
};

// ============================================
// ADMIN
// ============================================

export const registerAdmin = async (adminData: any) => {
  return api.post('/admin/register', adminData);
};

// ============================================
// DOCTORS
// ============================================

export const getAllDoctors = async () => {
  return api.get('/doctor/doctors');
};

export const getDoctorsByDepartment = async (department: string) => {
  return api.get(`/doctor/doctors/department/${department}`);
};

export const getDoctorById = async (doctorId: string) => {
  return api.get(`/doctor/${doctorId}`);
};

export const getAvailableSlots = async (doctorId: string, date: string) => {
  return api.get(`/doctor/doctors/${doctorId}/slots`, {
    params: { date }
  });
};

// ============================================
// APPOINTMENTS
// ============================================

export const createAppointment = async (appointmentData: {
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  patientDetails: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    reasonForVisit?: string;
    preferredLanguage?: string;
  };
}) => {
  return api.post('/appointment', appointmentData);
};

export const getAllAppointments = async () => {
  return api.get('/appointment');
};

// ✅ NEW: Get appointments by patient ID (PRIMARY METHOD)
export const getAppointmentsByPatientId = async (patientId: string) => {
  return api.get(`/appointment/patient/${patientId}`);
};

// ✅ BACKUP: Get appointments by email (alternative method)
export const getAppointmentsByEmail = async (email: string) => {
  return api.get(`/appointment/patient/email/${encodeURIComponent(email)}`);
};

export const getAppointmentsByDoctor = async (doctorId: string) => {
  return api.get(`/appointment/doctor/${doctorId}`);
};

// ============================================
// USERS
// ============================================

export const login = async (credentials: {
  userName: string;
  password: string;
}) => {
  return api.post('/user/login', credentials);
};

export const registerDoctor = async (doctorData: any) => {
  return api.post('/user/register/doctor', doctorData);
};

export const registerPatient = async (patientData: any) => {
  return api.post('/user/register/patient', patientData);
};

export const getAllUsers = async () => {
  return api.get('/user');
};

export const updatePatient = async (patientData: any) => {
  return api.post('/user/update/patient', patientData);
};

export const updateDoctor = async (doctorData: any) => {
  return api.post('/user/update/doctor', doctorData);
};

// ============================================
// PATIENT
// ============================================

export const getPatientById = async (patientId: string) => {
  return api.get(`/patient/${patientId}`);
};

export const getAllStaff = async () => {
  return axios.get(`${API_BASE_URL}/staff`);
};

export const createStaff = async (staffData: any) => {
  return axios.post(`${API_BASE_URL}/staff`, staffData);
};

export const updateStaff = async (id: string, staffData: any) => {
  return axios.put(`${API_BASE_URL}/staff/${id}`, staffData);
};

export const deleteStaff = async (id: string) => {
  return axios.delete(`${API_BASE_URL}/staff/${id}`);
};

// Schedule API
export const getAllSchedules = async (params?: any) => {
  return axios.get(`${API_BASE_URL}/schedule`, { params });
};

export const createSchedule = async (scheduleData: any) => {
  return axios.post(`${API_BASE_URL}/schedule`, scheduleData);
};

export const updateSchedule = async (id: string, scheduleData: any) => {
  return axios.put(`${API_BASE_URL}/schedule/${id}`, scheduleData);
};

export const deleteSchedule = async (id: string) => {
  return axios.delete(`${API_BASE_URL}/schedule/${id}`);
};

export const getAvailableStaff = async (params: any) => {
  return axios.get(`${API_BASE_URL}/schedule/available-staff`, { params });
};


export default api;