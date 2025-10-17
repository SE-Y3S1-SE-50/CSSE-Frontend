"use client";
import React, { useState, useEffect } from "react";

export default function DiagnosisList({ onEdit }: any) {
  const [diagnoses, setDiagnoses] = useState([]);

  const fetchDiagnoses = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`);
    const data = await res.json();
    setDiagnoses(data);
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this diagnosis?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis/${id}`, {
      method: "DELETE",
    });
    fetchDiagnoses();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">Diagnosis Records</h2>
      {diagnoses.length === 0 ? (
        <p>No diagnosis records yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 border border-gray-600">Patient ID</th>
              <th className="p-2 border border-gray-600">Patient Name</th>
              <th className="p-2 border border-gray-600">Diagnosis</th>
              <th className="p-2 border border-gray-600">Severity</th>
              <th className="p-2 border border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((d: any) => (
              <tr key={d._id} className="hover:bg-gray-700">
                <td className="p-2 border border-gray-600">{d.patientId}</td>
                <td className="p-2 border border-gray-600">{d.patientName}</td>
                <td className="p-2 border border-gray-600">{d.diagnosis}</td>
                <td className="p-2 border border-gray-600">{d.severity}</td>
                <td className="p-2 border border-gray-600 flex gap-2 justify-center">
                  <button
                    onClick={() => onEdit(d)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
