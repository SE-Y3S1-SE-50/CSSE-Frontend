import axios from 'axios';

export const createAppointment = async (formData: any) => {
  return axios.post('http://localhost:8000/api/appointment/appointments', formData);
};
