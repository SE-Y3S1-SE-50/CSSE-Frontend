'use client';

import { useState, useEffect } from 'react';
import { createSchedule, getAvailableStaff, getAllDepartments, getAllStaff } from '../../utils/api';

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: {
    _id: string;
    name: string;
  };
}

interface Department {
  _id: string;
  name: string;
}

interface ScheduleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedStaffId?: string;
  userId?: string;
}

export default function ScheduleAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  selectedStaffId,
  userId
}: ScheduleAssignmentModalProps) {
  const [formData, setFormData] = useState({
    staffId: selectedStaffId || '',
    departmentId: '',
    shiftDate: '',
    shiftType: 'Morning',
    startTime: '08:00',
    endTime: '17:00',
    notes: ''
  });
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDataLoading(true);
      Promise.all([fetchDepartments(), fetchAllStaff()]).finally(() => {
        setDataLoading(false);
      });
      // Don't fetch available staff until we have all required parameters
      if (formData.shiftDate && formData.startTime && formData.endTime) {
        fetchAvailableStaff();
      }
    }
  }, [isOpen, formData.shiftDate, formData.startTime, formData.endTime, formData.departmentId]);

  // Filter staff when allStaff or departmentId changes
  useEffect(() => {
    if (allStaff.length > 0) {
      filterStaffByDepartment(formData.departmentId);
    }
  }, [allStaff, formData.departmentId]);

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchAllStaff = async () => {
    try {
      const response = await getAllStaff();
      setAllStaff(response.data || []);
      // Initially show all staff, will be filtered when department is selected
      setAvailableStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setAllStaff([]);
      setAvailableStaff([]);
    }
  };

  const filterStaffByDepartment = (departmentId: string) => {
    if (!departmentId) {
      // If no department selected, show all staff
      setAvailableStaff(allStaff);
    } else {
      // Filter staff by selected department
      const filteredStaff = allStaff.filter(staff => 
        staff.department && staff.department._id === departmentId
      );
      setAvailableStaff(filteredStaff);
    }
  };

  const fetchAvailableStaff = async () => {
    try {
      const response = await getAvailableStaff({
        date: formData.shiftDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        departmentId: formData.departmentId || undefined
      });
      setAvailableStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching available staff:', error);
      setAvailableStaff([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'shiftDate' || name === 'startTime' || name === 'endTime' || name === 'departmentId') {
      // Reset staff selection when time or department changes
      if (name !== 'staffId') {
        setFormData(prev => ({
          ...prev,
          staffId: ''
        }));
      }
      
      // If department changes, filter staff by department
      if (name === 'departmentId') {
        filterStaffByDepartment(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Form data:', formData);
      console.log('User ID:', userId);
      
      const scheduleData = {
        ...formData,
        shiftDate: new Date(formData.shiftDate).toISOString(),
        createdBy: userId
      };
      console.log('Creating schedule with data:', scheduleData);
      
      // Validate required fields
      if (!scheduleData.staffId || !scheduleData.departmentId || !scheduleData.shiftDate || !scheduleData.createdBy) {
        throw new Error('Missing required fields');
      }
      
      const response = await createSchedule(scheduleData);
      console.log('Schedule created successfully:', response.data);
      
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        staffId: '',
        departmentId: '',
        shiftDate: '',
        shiftType: 'Morning',
        startTime: '08:00',
        endTime: '17:00',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error creating schedule';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assign Staff Schedule</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              required
              disabled={dataLoading}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
            >
              <option value="">{dataLoading ? 'Loading departments...' : 'Select Department'}</option>
              {Array.isArray(departments) && departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member
            </label>
            <select
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              required
              disabled={dataLoading || !formData.departmentId}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
            >
              <option value="">
                {dataLoading ? 'Loading staff...' : 
                 formData.departmentId ? 'Select Staff Member from Department' : 
                 'Select Department First'}
              </option>
              {Array.isArray(availableStaff) && availableStaff.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.firstName} {staff.lastName} ({staff.role})
                </option>
              ))}
            </select>
            {formData.departmentId && availableStaff.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No staff members found in this department</p>
            )}
            {formData.shiftDate && formData.startTime && formData.endTime && availableStaff.length === 0 && !formData.departmentId && (
              <p className="text-sm text-gray-500 mt-1">No available staff for this time slot</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Date
            </label>
            <input
              type="date"
              name="shiftDate"
              value={formData.shiftDate}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Type
            </label>
            <select
              name="shiftType"
              value={formData.shiftType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
              <option value="Full Day">Full Day</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || dataLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
