"use client";
import React, { useState, useEffect } from "react";
import DiagnosisCount from "./DiagnosisCount";

const SEVERITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" },
];

export default function DiagnosisList({ onEdit }: any) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("");

  const fetchDiagnoses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`);
      const data = await res.json();
      setDiagnoses(data);
    } catch (err) {
      console.error("Error fetching diagnoses:", err);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this diagnosis?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis/${id}`, {
        method: "DELETE",
      });
      fetchDiagnoses();
    } catch (err) {
      console.error("Error deleting diagnosis:", err);
    }
  };

  // Filter diagnoses by severity
  const filteredDiagnoses = diagnoses.filter((d: any) => {
    const severity =
      d.severityType?.toLowerCase() ||
      d.severity?.toLowerCase() ||
      "";
    return !severityFilter || severity === severityFilter;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <DiagnosisCount count={diagnoses.length} />

<h2 className="text-2xl font-semibold mb-4">Diagnosis Records</h2>


        <div>
          <label htmlFor="severity-filter" className="mr-2 text-gray-300">
            Filter by Severity:
          </label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filteredDiagnoses.length === 0 ? (
        <p>No diagnosis records{severityFilter ? ` for "${SEVERITY_OPTIONS.find(o => o.value === severityFilter)?.label}"` : ""}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="p-2 border border-gray-600">Patient ID</th>
                <th className="p-2 border border-gray-600">Patient Name</th>
                <th className="p-2 border border-gray-600">Symptoms</th>
                <th className="p-2 border border-gray-600">Diagnosis</th>
                <th className="p-2 border border-gray-600">Remarks</th>
                <th className="p-2 border border-gray-600">Diagnosis Date</th>
                <th className="p-2 border border-gray-600">Severity</th>
                <th className="p-2 border border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiagnoses.map((d: any) => (
                <tr key={d._id} className="hover:bg-gray-700 transition-colors">
                  <td className="p-2 border border-gray-600">{d.patientId}</td>
                  <td className="p-2 border border-gray-600 font-medium">{d.patientName}</td>
                  <td className="p-2 border border-gray-600">{d.symptoms}</td>
                  <td className="p-2 border border-gray-600">{d.diagnosis}</td>
                  <td className="p-2 border border-gray-600">{d.remarks || "—"}</td>
                  <td className="p-2 border border-gray-600">
                    {d.diagnosisDate
                      ? new Date(d.diagnosisDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-2 border border-gray-600 text-center">
                    {(() => {
                      const severity =
                        d.severityType?.toLowerCase() ||
                        d.severity?.toLowerCase() ||
                        "";

                      let colorClass = "";
                      if (severity === "severe") colorClass = "bg-red-600 text-white";
                      else if (severity === "moderate") colorClass = "bg-yellow-500 text-black";
                      else if (severity === "mild") colorClass = "bg-green-600 text-white";
                      else colorClass = "bg-gray-500 text-white";

                      return (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                          {severity
                            ? severity.charAt(0).toUpperCase() + severity.slice(1)
                            : "—"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-2 border border-gray-600 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(d)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-black font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}