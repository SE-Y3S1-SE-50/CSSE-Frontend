import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// APPOINTMENT APIs
// ============================================
export const createAppointment = async (appointmentData: any) => {
  return await api.post('/appointment', appointmentData);
};

export const getAllAppointments = async () => {
  return await api.get('/appointment');
};

export const getAppointmentsByPatient = async (email: string) => {
  return await api.get(`/appointment/patient/${email}`);
};

export const getAppointmentsByDoctor = async (doctorId: string) => {
  return await api.get(`/appointment/doctor/${doctorId}`);
};

// ============================================
// DEPARTMENT APIs
// ============================================
export const getAllDepartments = async () => {
  return await api.get('/department');
};

export const seedDepartments = async () => {
  return await api.post('/department/seed');
};

// ============================================
// DOCTOR APIs
// ============================================
export const getAllDoctors = async () => {
  return await api.get('/doctor/doctors');
};

export const getDoctorsByDepartment = async (department: string) => {
  return await api.get(`/doctor/doctors/department/${department}`);
};

export const getAvailableSlots = async (doctorId: string, date: string) => {
  return await api.get(`/doctor/doctors/${doctorId}/slots`, {
    params: { date }
  });
};

export const getDoctorById = async (id: string) => {
  return await api.get(`/doctor/${id}`);
};

export const seedDoctors = async () => {
  return await api.post('/doctor/doctors/seed');
};

// ============================================
// AUTH APIs
// ============================================
export const login = async (credentials: { userName: string; password: string }) => {
  return await api.post('/user/login', credentials);
};

export const registerPatient = async (patientData: any) => {
  return await api.post('/user/register/patient', patientData);
};

export const registerDoctor = async (doctorData: any) => {
  return await api.post('/user/register/doctor', doctorData);
};

export const logout = async () => {
  return await api.post('/logout');
};

export const checkAuth = async () => {
  return await api.get('/check-cookie');
};

// ============================================
// PATIENT APIs
// ============================================
export const getPatientById = async (id: string) => {
  return await api.get(`/patient/${id}`);
};

export const updatePatient = async (patientData: any) => {
  return await api.post('/user/update/patient', patientData);
};

// ============================================
// USER APIs
// ============================================
export const getAllUsers = async () => {
  return await api.get('/user');
};

export const updateDoctor = async (doctorData: any) => {
  return await api.post('/user/update/doctor', doctorData);
};

export default api;