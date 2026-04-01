"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/client-api";
import { KW_OPTIONS } from "@/lib/constants";

export default function CallModal({ lead, open, onClose, onSaved }) {
  const [callStatus, setCallStatus] = useState("CNR");
  const [followUpDate, setFollowUpDate] = useState("");
  const [customerType, setCustomerType] = useState(lead?.customerType || "Domestic");
  const [requirementKw, setRequirementKw] = useState(lead?.requirementKw || "3");
  const [customKw, setCustomKw] = useState("");
  const [visited, setVisited] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [houseNo, setHouseNo] = useState(lead?.address?.houseNo || "");
  const [city, setCity] = useState(lead?.address?.city || lead?.city || "");
  const [pincode, setPincode] = useState(lead?.address?.pincode || lead?.pincode || "");
  const [landmark, setLandmark] = useState(lead?.address?.landmark || "");
  const [mapsLink, setMapsLink] = useState(lead?.address?.mapsLink || "");
  const [notes, setNotes] = useState(lead?.notes || "");
  const [submitStatus, setSubmitStatus] = useState("pending");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lead) return;
    setCustomerType(lead.customerType || "Domestic");
    setRequirementKw(lead.requirementKw || "3");
    setVisited(!!lead.visited);
    setHouseNo(lead.address?.houseNo || "");
    setCity(lead.address?.city || lead.city || "");
    setPincode(lead.address?.pincode || lead.pincode || "");
    setLandmark(lead.address?.landmark || "");
    setMapsLink(lead.address?.mapsLink || "");
    setNotes(lead.notes || "");
  }, [lead, open]);

  if (!open || !lead) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("leadId", lead._id);
      form.append("callStatus", callStatus);
      if (followUpDate) form.append("followUpDate", followUpDate);
      form.append("customerType", customerType);
      const kw =
        requirementKw === "Custom" ? customKw || lead.requirementKw : requirementKw;
      form.append("requirementKw", kw);
      form.append("visited", visited ? "true" : "false");
      if (visitDate) form.append("visitDate", visitDate);
      form.append("address.city", city);
      form.append("address.pincode", pincode);
      form.append("address.houseNo", houseNo);
      form.append("address.landmark", landmark);
      form.append("address.mapsLink", mapsLink);
      form.append("notes", notes);
      form.append("submitStatus", submitStatus);
      if (file) form.append("quotation", file);

      await apiFetch("/api/calls", { method: "POST", body: form });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 sm:items-center">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Call: {lead.customerName}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <form onSubmit={submit} className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            Call status
            <select value={callStatus} onChange={(e) => setCallStatus(e.target.value)}>
              <option>Interested</option>
              <option>Not Interested</option>
              <option>CNR</option>
              <option>Busy</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Follow-up date
            <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            Customer type
            <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
              <option>Domestic</option>
              <option>Commercial</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Requirement (kW)
            <select value={requirementKw} onChange={(e) => setRequirementKw(e.target.value)}>
              {KW_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          {requirementKw === "Custom" && (
            <input
              placeholder="Custom kW"
              value={customKw}
              onChange={(e) => setCustomKw(e.target.value)}
            />
          )}
          <div className="flex items-center gap-2">
            <input
              id="vis"
              type="checkbox"
              checked={visited}
              onChange={(e) => setVisited(e.target.checked)}
            />
            <label htmlFor="vis">Visited</label>
          </div>
          <label className="flex flex-col gap-1">
            Visit date
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          </label>
          <p className="text-xs text-slate-500">Address (required for Done)</p>
          <input placeholder="House no." value={houseNo} onChange={(e) => setHouseNo(e.target.value)} />
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          <input placeholder="Landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          <input
            placeholder="Google Maps link"
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
          />
          <label className="flex flex-col gap-1">
            Quotation PDF
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="flex flex-col gap-1">
            Notes
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            Submit as
            <select value={submitStatus} onChange={(e) => setSubmitStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </label>
          <p className="text-xs text-amber-200/90">
            Marking Done requires Visited and full address (house no., city, pincode).
          </p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Submit call"}
          </button>
        </form>
      </div>
    </div>
  );
}
