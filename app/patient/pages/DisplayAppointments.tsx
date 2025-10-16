"use client";
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface PatientDetails {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  reasonForVisit?: string;
  preferredLanguage?: string;
}

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  status: string;
  patientDetails: PatientDetails;
  createdAt: string;
  updatedAt: string;
}

const DisplayAppointments = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      // Get current user info
      const authResponse = await fetch(`${API_BASE_URL}/api/check-cookie`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!authResponse.ok) {
        setError('Authentication failed');
        setIsLoading(false);
        return;
      }

      const authData = await authResponse.json();
      console.log('Auth data:', authData);
      
      // Get patient details
      const patientResponse = await fetch(`${API_BASE_URL}/api/patient/${authData.id}`, {
        credentials: 'include',
      });

      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        console.log('Patient data:', patientData);
        const patient = patientData[0];
        const email = patient?.email;
        
        if (email) {
          setPatientEmail(email);
          await fetchAppointments(email);
        } else {
          setError('No email found for patient');
          setIsLoading(false);
        }
      } else {
        setError('Failed to fetch patient details');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient information');
      setIsLoading(false);
    }
  };

  const fetchAppointments = async (email: string) => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/api/appointment/patient/${email}`, {
        credentials: 'include',
      });

      console.log('Fetching appointments for email:', email);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }

      const data = await response.json();
      console.log('Appointments data:', data);
      setAppointments(data.appointments || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isUpcoming = (dateString: string, timeSlot: string) => {
    const appointmentDate = new Date(dateString);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate > new Date();
  };

  const upcomingAppointments = appointments.filter(apt => 
    isUpcoming(apt.date, apt.timeSlot) && apt.status.toLowerCase() === 'confirmed'
  );
  
  const pastAppointments = appointments.filter(apt => 
    !isUpcoming(apt.date, apt.timeSlot) || apt.status.toLowerCase() !== 'confirmed'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-white text-lg">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-bold text-lg mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => {
              setError('');
              setIsLoading(true);
              fetchPatientData();
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Appointments</h1>
        <p className="text-gray-400">View and manage your medical appointments</p>
        {patientEmail && (
          <p className="text-gray-500 text-sm mt-1">Showing appointments for: {patientEmail}</p>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-white mb-2">No Appointments Yet</h2>
          <p className="text-gray-400 mb-6">You haven't booked any appointments yet.</p>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('appointment')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Book Your First Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔔</span> Upcoming Appointments ({upcomingAppointments.length})
              </h2>
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{appointment.department}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">👤</span>
                            <span>{appointment.patientDetails.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">📅</span>
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">🕐</span>
                            <span>{appointment.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">👨‍⚕️</span>
                            <span>Doctor ID: {appointment.doctorId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">📧</span>
                            <span>{appointment.patientDetails.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">📱</span>
                            <span>{appointment.patientDetails.phone}</span>
                          </div>
                        </div>

                        {appointment.patientDetails.reasonForVisit && (
                          <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-400">Reason for Visit:</p>
                            <p className="text-white">{appointment.patientDetails.reasonForVisit}</p>
                          </div>
                        )}

                        {appointment.patientDetails.preferredLanguage && (
                          <div className="mt-2 text-sm text-gray-400">
                            <span>Preferred Language: </span>
                            <span className="text-white">{appointment.patientDetails.preferredLanguage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Past Appointments ({pastAppointments.length})
              </h2>
              <div className="grid gap-4">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{appointment.department}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">👤</span>
                            <span>{appointment.patientDetails.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">📅</span>
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">🕐</span>
                            <span>{appointment.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">👨‍⚕️</span>
                            <span>Doctor ID: {appointment.doctorId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Appointment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{appointments.length}</p>
                <p className="text-gray-400 text-sm">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{upcomingAppointments.length}</p>
                <p className="text-gray-400 text-sm">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">{pastAppointments.length}</p>
                <p className="text-gray-400 text-sm">Past</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">
                  {appointments.filter(a => a.status.toLowerCase() === 'confirmed').length}
                </p>
                <p className="text-gray-400 text-sm">Confirmed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayAppointments;
