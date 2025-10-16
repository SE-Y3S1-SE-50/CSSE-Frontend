'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { AppointmentForm, PatientDetails, Department, Doctor } from '../../types/appointment';
import { 
  createAppointment, 
  getAllDepartments, 
  getDoctorsByDepartment,
  getAvailableSlots 
} from '../../utils/api';

const steps = [
  { number: 1, title: 'Department' },
  { number: 2, title: 'Schedule' },
  { number: 3, title: 'Details' },
  { number: 4, title: 'Confirm' },
];

// Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-start justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : currentStep === step.number
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span
              className={`text-xs mt-2 font-medium whitespace-nowrap ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.title}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-1 flex items-center pt-[20px] px-2">
              <div
                className={`h-[2px] w-full transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// Step 1: Department Selection
const DepartmentStep = ({ 
  form, 
  setForm,
  departments,
  loading
}: { 
  form: AppointmentForm; 
  setForm: React.Dispatch<React.SetStateAction<AppointmentForm>>;
  departments: Department[];
  loading: boolean;
}) => (
  <div className="space-y-6 text-black">
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Select Department
      </h3>
      <p className="text-sm text-gray-600">
        Choose the medical department for your appointment
      </p>
    </div>
    
    {loading ? (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading departments...</p>
      </div>
    ) : departments.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-600">No departments available. Please contact support.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4">
        {departments.map((dept) => (
          <button
            key={dept._id}
            onClick={() => setForm({ ...form, department: dept.name })}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              form.department === dept.name
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{dept.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {dept.description}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  form.department === dept.name
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {form.department === dept.name && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

// Step 2: Schedule Selection
const ScheduleStep = ({
  form,
  handleChange,
  setForm,
  selectedDoctor,
  handleDoctorSelection,
  doctors,
  availableSlots,
  loadingDoctors,
  loadingSlots
}: {
  form: AppointmentForm;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<AppointmentForm>>;
  selectedDoctor: string;
  handleDoctorSelection: (doctor: Doctor) => void;
  doctors: Doctor[];
  availableSlots: string[];
  loadingDoctors: boolean;
  loadingSlots: boolean;
}) => (
  <div className="space-y-6 text-black">
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Choose Schedule & Doctor
      </h3>
      <p className="text-sm text-gray-600">
        Select your preferred doctor, date, and time
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Doctor
      </label>
      {loadingDoctors ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No doctors available in this department.</p>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <button
              key={doc._id}
              onClick={() => handleDoctorSelection(doc)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedDoctor === `${doc.firstName} ${doc.lastName}`
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Dr. {doc.firstName} {doc.lastName}</h4>
                  <p className="text-sm text-gray-600">{doc.specialization || doc.department}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {doc.workingDays?.join(', ') || 'Weekdays'}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedDoctor === `${doc.firstName} ${doc.lastName}`
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedDoctor === `${doc.firstName} ${doc.lastName}` && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Date
      </label>
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        min={new Date().toISOString().split('T')[0]}
        disabled={!form.doctorId}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {!form.doctorId && (
        <p className="text-xs text-gray-500 mt-1">Please select a doctor first</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Time Slot
        {loadingSlots && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
      </label>
      {!form.date ? (
        <p className="text-sm text-gray-500 py-4">Please select a date first</p>
      ) : loadingSlots ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No available slots for this date. Please choose another date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setForm({ ...form, timeSlot: slot })}
              className={`p-3 rounded-lg border-2 transition-all ${
                form.timeSlot === slot
                  ? 'border-blue-600 bg-blue-50 font-semibold'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Step 3: Patient Details
const DetailsStep = ({
  patientDetails,
  handlePatientDetailsChange
}: {
  patientDetails: PatientDetails;
  handlePatientDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) => (
  <div className="space-y-5 text-black">
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Patient Information
      </h3>
      <p className="text-sm text-gray-600">
        Please provide your contact and visit details
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Full Name <span className="text-red-500">*</span>
      </label>
      <input
        name="fullName"
        type="text"
        value={patientDetails.fullName}
        onChange={handlePatientDetailsChange}
        placeholder="Enter your full name"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address <span className="text-red-500">*</span>
      </label>
      <input
        name="email"
        type="email"
        value={patientDetails.email}
        onChange={handlePatientDetailsChange}
        placeholder="your.email@example.com"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        name="phone"
        type="tel"
        value={patientDetails.phone}
        onChange={handlePatientDetailsChange}
        placeholder="+1 (555) 000-0000"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Address
      </label>
      <textarea
        name="address"
        value={patientDetails.address}
        onChange={handlePatientDetailsChange}
        placeholder="Enter your address"
        rows={3}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Reason for Visit
      </label>
      <textarea
        name="reasonForVisit"
        value={patientDetails.reasonForVisit}
        onChange={handlePatientDetailsChange}
        placeholder="Briefly describe the reason for your visit"
        rows={3}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Preferred Language
      </label>
      <select
        name="preferredLanguage"
        value={patientDetails.preferredLanguage}
        onChange={handlePatientDetailsChange}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        <option value="German">German</option>
        <option value="Chinese">Chinese</option>
        <option value="Hindi">Hindi</option>
        <option value="Tamil">Tamil</option>
      </select>
    </div>
  </div>
);

// Step 4: Confirmation
const ConfirmationStep = ({
  message,
  form,
  selectedDoctor,
  patientDetails,
  handleSubmit,
  confirmationNumber,
  isSubmitting
}: {
  message: string;
  form: AppointmentForm;
  selectedDoctor: string;
  patientDetails: PatientDetails;
  handleSubmit: () => void;
  confirmationNumber: string;
  isSubmitting: boolean;
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 text-black">
      {!message ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm Your Appointment
            </h3>
            <p className="text-sm text-gray-600">
              Please review your appointment details
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="border-b pb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Appointment Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold">{form.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-semibold">{selectedDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{formatDate(form.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{form.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Patient Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{patientDetails.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{patientDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{patientDetails.phone}</span>
                </div>
                {patientDetails.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-right max-w-xs">
                      {patientDetails.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-semibold">
                    {patientDetails.preferredLanguage}
                  </span>
                </div>
              </div>
            </div>

            {patientDetails.reasonForVisit && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Reason for Visit
                </h4>
                <p className="text-gray-700">{patientDetails.reasonForVisit}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg transition font-semibold ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Booking...' : 'Confirm & Book Appointment'}
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Appointment Confirmed!
          </h3>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              Appointment Summary
            </h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation:</span>
                <span className="font-semibold">#{confirmationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">
                  {formatDate(form.date)} at {form.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-semibold">{selectedDoctor}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to{' '}
            <span className="font-semibold">{patientDetails.email}</span>
          </p>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function AppointmentFormComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<AppointmentForm>({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    timeSlot: '',
  });

  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    reasonForVisit: '',
    preferredLanguage: 'English',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const confirmationNumber = useMemo(() => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await getAllDepartments();
        setDepartments(res.data.departments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please refresh the page.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch doctors when department changes
  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      return;
    }

    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await getDoctorsByDepartment(form.department);
        setDoctors(res.data.doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [form.department]);

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await getAvailableSlots(form.doctorId, form.date);
        setAvailableSlots(res.data.availableSlots);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setError('Failed to load available time slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [form.doctorId, form.date]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePatientDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setPatientDetails({ ...patientDetails, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctor(`Dr. ${doctor.firstName} ${doctor.lastName}`);
    setForm({ ...form, doctorId: doctor.doctorId, timeSlot: '' }); // Reset time slot when doctor changes
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateStep = () => {
    if (currentStep === 1 && !form.department) {
      setError('Please select a department');
      return false;
    }
    if (currentStep === 2) {
      if (!form.doctorId) {
        setError('Please select a doctor');
        return false;
      }
      if (!form.date) {
        setError('Please select a date');
        return false;
      }
      if (!form.timeSlot) {
        setError('Please select a time slot');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!patientDetails.fullName || !patientDetails.email || !patientDetails.phone) {
        setError('Please fill in all required fields');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientDetails.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const appointmentData = {
        patientId: patientDetails.email,
        doctorId: form.doctorId,
        department: form.department,
        date: form.date,
        timeSlot: form.timeSlot,
        patientDetails
      };

      const res = await createAppointment(appointmentData);
      setMessage('Appointment booked successfully!');
      console.log('Appointment created:', res.data);
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.error || 'Error booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Book an Appointment</h2>
        <p className="text-gray-600 mt-2">
          Complete the steps below to schedule your visit
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <DepartmentStep 
            form={form} 
            setForm={setForm} 
            departments={departments}
            loading={loadingDepartments}
          />
        )}
        {currentStep === 2 && (
          <ScheduleStep
            form={form}
            handleChange={handleChange}
            setForm={setForm}
            selectedDoctor={selectedDoctor}
            handleDoctorSelection={handleDoctorSelection}
            doctors={doctors}
            availableSlots={availableSlots}
            loadingDoctors={loadingDoctors}
            loadingSlots={loadingSlots}
          />
        )}
        {currentStep === 3 && (
          <DetailsStep
            patientDetails={patientDetails}
            handlePatientDetailsChange={handlePatientDetailsChange}
          />
        )}
        {currentStep === 4 && (
          <ConfirmationStep
            message={message}
            form={form}
            selectedDoctor={selectedDoctor}
            patientDetails={patientDetails}
            handleSubmit={handleSubmit}
            confirmationNumber={confirmationNumber}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-center text-sm">{error}</p>
        </div>
      )}

      {currentStep < 4 && (
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={nextStep}
            className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold ${
              currentStep === 1 ? 'w-full' : ''
            }`}
          >
            {currentStep === 3 ? 'Review Appointment' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
