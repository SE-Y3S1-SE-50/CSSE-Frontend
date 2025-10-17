'use client';

import { useState, useEffect } from 'react';
import { getAllSchedules, updateSchedule, deleteSchedule } from '../../utils/api';

interface Schedule {
  _id: string;
  staffId: {
    firstName: string;
    lastName: string;
    role: string;
  };
  departmentId: {
    name: string;
  };
  shiftDate: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
}

export default function SchedulePreview() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    shiftType: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedules();
      const schedulesData = response.data || [];
      setSchedules(schedulesData);
      if (schedulesData.length > 0) {
        setSelectedSchedule(schedulesData[0]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (!schedule.staffId || !schedule.departmentId) {
      return false;
    }
    const matches = schedule.staffId.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.staffId.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.departmentId.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matches;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleEdit = () => {
    if (selectedSchedule) {
      setIsEditing(true);
      setEditData({
        shiftType: selectedSchedule.shiftType,
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        notes: selectedSchedule.notes || ''
      });
    }
  };

  const handleSave = async () => {
    if (!selectedSchedule) return;

    try {
      setLoading(true);
      await updateSchedule(selectedSchedule._id, editData);
      
      // Update the local state
      const updatedSchedules = schedules.map(schedule => 
        schedule._id === selectedSchedule._id 
          ? { ...schedule, ...editData }
          : schedule
      );
      setSchedules(updatedSchedules);
      
      // Update the selected schedule
      setSelectedSchedule({ ...selectedSchedule, ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      shiftType: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteSchedule(scheduleId);
      
      // Update the local state
      const updatedSchedules = schedules.filter(schedule => schedule._id !== scheduleId);
      setSchedules(updatedSchedules);
      
      // Clear selected schedule if it was deleted
      if (selectedSchedule?._id === scheduleId) {
        setSelectedSchedule(null);
      }
      
      console.log('Schedule deleted successfully');
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      alert(error.response?.data?.message || 'Error deleting schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedSchedule) return;

    try {
      setLoading(true);
      await updateSchedule(selectedSchedule._id, { status: newStatus });
      
      // Update the local state
      const updatedSchedules = schedules.map(schedule => 
        schedule._id === selectedSchedule._id 
          ? { ...schedule, status: newStatus }
          : schedule
      );
      setSchedules(updatedSchedules);
      
      // Update selected schedule
      setSelectedSchedule({ ...selectedSchedule, status: newStatus });
      setIsChangingStatus(false);
      
      console.log('Schedule status updated successfully');
    } catch (error: any) {
      console.error('Error updating schedule status:', error);
      alert(error.response?.data?.message || 'Error updating schedule status');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Preview</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading schedules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Preview</h2>
      
      {/* Search and Actions */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </div>
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            disabled={!selectedSchedule}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No schedules found matching your search' : 'No schedules available'}
          </div>
        ) : (
          Array.isArray(filteredSchedules) && filteredSchedules.map((schedule) => (
            <div
              key={schedule._id}
              onClick={() => setSelectedSchedule(schedule)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSchedule?._id === schedule._id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {schedule.staffId?.firstName} {schedule.staffId?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {schedule.departmentId?.name} • {schedule.staffId?.role}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(schedule.shiftDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    schedule.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSchedule(schedule);
                      setIsChangingStatus(true);
                    }}
                    disabled={loading}
                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                    title="Change status"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(schedule._id);
                    }}
                    disabled={loading}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                    title="Delete schedule"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Schedule Details */}
      {selectedSchedule && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Schedule Details</h3>
            <button
              onClick={() => handleDelete(selectedSchedule._id)}
              disabled={loading}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded disabled:opacity-50"
            >
              Delete Schedule
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-gray-600">{formatDate(selectedSchedule.shiftDate)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Time:</span>
              {isEditing ? (
                <div className="flex space-x-2 mt-1">
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                  />
                </div>
              ) : (
                <span className="ml-2 text-gray-600">
                  {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                </span>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Shift Type:</span>
              {isEditing ? (
                <select
                  value={editData.shiftType}
                  onChange={(e) => handleInputChange('shiftType', e.target.value)}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-gray-900"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Full Day">Full Day</option>
                </select>
              ) : (
                <span className="ml-2 text-gray-600">{selectedSchedule.shiftType}</span>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Staff:</span>
              <span className="ml-2 text-gray-600">
                {selectedSchedule.staffId?.firstName} {selectedSchedule.staffId?.lastName}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <span className="ml-2 text-gray-600">{selectedSchedule.departmentId?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              {isChangingStatus ? (
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    value={selectedSchedule.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                    disabled={loading}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    onClick={() => setIsChangingStatus(false)}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedSchedule.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    selectedSchedule.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    selectedSchedule.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    selectedSchedule.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedSchedule.status}
                  </span>
                  <button
                    onClick={() => setIsChangingStatus(true)}
                    disabled={loading}
                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Notes:</span>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-gray-900 w-full mt-1"
                  rows={2}
                  placeholder="Add notes..."
                />
              ) : (
                <span className="ml-2 text-gray-600">{selectedSchedule.notes || 'No notes'}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
