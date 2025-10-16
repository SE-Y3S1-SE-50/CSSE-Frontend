import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Appointment API
export const createAppointment = async (formData: any) => {
  return axios.post(`${API_BASE_URL}/appointment/appointments`, formData);
};

// Auth API
export const login = async (credentials: { userName: string; password: string }) => {
  return axios.post(`${API_BASE_URL}/user/login`, credentials);
};

export const checkAuth = async () => {
  return axios.get(`${API_BASE_URL}/check-cookie`);
};

export const logout = async () => {
  return axios.post(`${API_BASE_URL}/logout`);
};

// Staff API
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

// Department API
export const getAllDepartments = async () => {
  const response = await axios.get(`${API_BASE_URL}/department`);
  return { data: response.data.departments };
};

// Admin API
export const registerAdmin = async (adminData: any) => {
  return axios.post(`${API_BASE_URL}/admin/register`, adminData);
};
