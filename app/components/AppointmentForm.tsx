'use client'
import { useState } from 'react';
import { AppointmentForm } from '../types/appointment';
import { createAppointment } from '../utils/api';

const departments = ['Cardiology', 'Neurology', 'Orthopedics'] as const;

const doctors = {
  Cardiology: ['D001', 'D002'],
  Neurology: ['D003'],
  Orthopedics: ['D004'],
};

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00'];

export default function AppointmentFormComponent() {
  const [form, setForm] = useState<AppointmentForm>({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    timeSlot: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async () => {
    try {
      const res = await createAppointment(form);
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error booking appointment');
    }
  };

  const selectedDoctors =
    doctors[form.department as keyof typeof doctors] || [];

  return (
    <div className="max-w-xl ring-[1px] ring-black text-black mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Make an Appointment</h2>

      <div className="space-y-4">
        <input
          name="patientId"
          placeholder="Patient ID"
          value={form.patientId}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
          disabled={!form.department}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="">Select Doctor</option>
          {selectedDoctors.map((doc) => (
            <option key={doc} value={doc}>
              {doc}
            </option>
          ))}
        </select>

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />

        <select
          name="timeSlot"
          value={form.timeSlot}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="">Select Time Slot</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Confirm Appointment
        </button>

        {message && (
          <p className="text-green-600 text-center mt-4">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
