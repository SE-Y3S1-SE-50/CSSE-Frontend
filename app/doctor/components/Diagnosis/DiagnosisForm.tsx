"use client";
import React, { useState, useEffect } from "react";

export default function DiagnosisForm({ onSuccess, editingDiagnosis, onCancelEdit }: any) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    symptoms: "",
    diagnosis: "",
    remarks: "",
    diagnosisDate: "",
    severity: "Mild",
  });
  const [existingPatientIds, setExistingPatientIds] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (editingDiagnosis) setFormData(editingDiagnosis);
  }, [editingDiagnosis]);

  useEffect(() => {
    // Fetch all diagnosis records to get existing patient IDs
    const fetchPatientIds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`);
        const data = await res.json();
        setExistingPatientIds(data.map((d: any) => d.patientId));
      } catch (err) {
        console.error("Error fetching patient IDs:", err);
      }
    };
    fetchPatientIds();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Only check for duplicate patientId when creating (not editing)
    if (!editingDiagnosis && existingPatientIds.includes(formData.patientId)) {
      setError("A record with this Patient ID already exists.");
      return;
    }

    // Prevent future dates for diagnosisDate
    if (formData.diagnosisDate) {
      const selectedDate = new Date(formData.diagnosisDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignore time part
      if (selectedDate > today) {
        setError("Diagnosis date cannot be in the future.");
        return;
      }
    }

    const url = editingDiagnosis
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis/${editingDiagnosis._id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`;

    const method = editingDiagnosis ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({
        patientId: "",
        patientName: "",
        symptoms: "",
        diagnosis: "",
        remarks: "",
        diagnosisDate: "",
        severity: "Mild",
      });
      onSuccess();
      if (onCancelEdit) onCancelEdit();
    } else {
      alert("Failed to save diagnosis");
    }
  };

  // Get today's date in YYYY-MM-DD format for max attribute
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 text-white">
      <h2 className="text-2xl font-semibold mb-2">
        {editingDiagnosis ? "Edit Diagnosis" : "New Patient Diagnosis"}
      </h2>

      <input
        name="patientId"
        placeholder="Patient ID"
        value={formData.patientId}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
        disabled={!!editingDiagnosis}
      />
      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}

      <input
        name="patientName"
        placeholder="Patient Name"
        value={formData.patientName}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
      />

      <textarea
        name="symptoms"
        placeholder="Symptoms"
        value={formData.symptoms}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
      />

      <textarea
        name="diagnosis"
        placeholder="Diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
      />

      <textarea
        name="remarks"
        placeholder="Remarks"
        value={formData.remarks}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
      />

      <input
        type="date"
        name="diagnosisDate"
        value={formData.diagnosisDate}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        max={todayStr} // Prevent selecting future dates
        required
      />

      <select
        name="severity"
        value={formData.severity}
        onChange={handleChange}
        className="w-full p-2 bg-gray-900 rounded text-white border border-gray-600"
        required
      >
        <option value="Mild">Mild</option>
        <option value="Moderate">Moderate</option>
        <option value="Severe">Severe</option>
      </select>

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          {editingDiagnosis ? "Update" : "Save"}
        </button>
        {editingDiagnosis && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}