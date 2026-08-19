"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { useRouter } from "next/navigation";

// Simple HTML5 Canvas Signature Pad
function SignaturePad({ value, onChange }: { value?: string; onChange?: (val: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution to match client size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange?.(canvas.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange?.("");
  };

  return (
    <div className="relative w-full h-32 border border-[#e1e5ea] rounded-xl bg-slate-50 overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute top-2 right-2 rounded-full border border-[#e1e5ea] bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 hover:text-slate-800 shadow-sm cursor-pointer"
      >
        Clear
      </button>
    </div>
  );
}

export default function ManualRideRequestsPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    confirmDob: false,
    phoneNumber: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationship: "",

    tripType: "one-way",
    schedule: "one-time",
    pickupAddress: "",
    destinationAddress: "",
    pickupDate: "",
    pickupTime: "",
    appointmentTime: "",
    fare: "",

    recurringStartDate: "",
    recurringEndDate: "",
    recurringDays: [] as string[],
    recurringPickupTime: "",
    recurringAppointmentTime: "",

    returnPickupAddress: "",
    returnDestinationAddress: "",
    returnDate: "",
    returnPickupTime: "",
    driverNotes: "",

    mobilityOptions: ["ambulatory"],
    specialInstructions: "",
    accessInformation: "",

    insuranceName: "",
    authNumber: "",
    privatePay: false,

    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",

    consentPhoto: false,
    consentTransport: false,
    consentEsignature: false,
    consentHipaa: false,

    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
    printedName: "",
    relationshipToPassenger: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const toggleMobilityOption = (option: string) => {
    const current = formData.mobilityOptions;
    if (current.includes(option)) {
      handleInputChange("mobilityOptions", current.filter((o) => o !== option));
    } else {
      handleInputChange("mobilityOptions", [...current, option]);
    }
  };

  const toggleRecurringDay = (day: string) => {
    const current = formData.recurringDays;
    if (current.includes(day)) {
      handleInputChange("recurringDays", current.filter((d) => d !== day));
    } else {
      handleInputChange("recurringDays", [...current, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Simple validation
    if (
      !formData.fullName ||
      !formData.dateOfBirth ||
      !formData.phoneNumber ||
      !formData.streetAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.emergencyContactName ||
      !formData.emergencyContactPhone ||
      !formData.relationship ||
      !formData.pickupAddress ||
      !formData.destinationAddress ||
      !formData.pickupDate ||
      !formData.pickupTime ||
      !formData.fare ||
      !formData.printedName ||
      !formData.signature
    ) {
      setErrorMsg("Please fill out all required fields and sign the document.");
      return;
    }

    setSubmitting(true);

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      if (token) {
        try {
          const res = await fetch(`${API_URL}/admin/trips`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...formData,
              fare: Number(formData.fare),
            }),
          });

          const result = await res.json();
          if (result.success) {
            setSuccessMsg("Manual ride request created successfully!");
            // Redirect to all ride requests list after a short delay
            setTimeout(() => {
              router.push("/ride-requests");
            }, 1500);
          } else {
            console.error("Validation error details:", result.error);
            const details = result.error?.details
              ? Object.entries(result.error.details)
                  .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
                  .join("; ")
              : "";
            setErrorMsg(
              (result.error?.message || "Failed to create manual ride request.") +
                (details ? ` Details: ${details}` : "")
            );
          }
        } catch (err) {
          setErrorMsg("A network error occurred. Please try again.");
        }
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="pb-10 space-y-6">
      <PageHeader
        title="Manual Ride Requests"
        description="Manually create a new ride request on behalf of a passenger."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {errorMsg && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Section 01: Passenger Information */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">01</span>
            <h2 className="text-base font-bold text-[#172033]">Passenger Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Full Name *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Date of Birth *</label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 py-1">
              <input
                id="confirmDob"
                type="checkbox"
                checked={formData.confirmDob}
                onChange={(e) => handleCheckboxChange("confirmDob", e.target.checked)}
                className="size-4"
              />
              <label htmlFor="confirmDob" className="text-xs text-[#69758a]">Confirm Date of Birth matches records</label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Phone Number *</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Email Address</label>
              <input
                type="email"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Street Address *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">City *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">State *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Zip Code *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Emergency Contact Name *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Emergency Contact Phone *</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Relationship to Passenger *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.relationship}
                onChange={(e) => handleInputChange("relationship", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 02: Trip Details */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">02</span>
            <h2 className="text-base font-bold text-[#172033]">Trip Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#172033]">Trip Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    checked={formData.tripType === "one-way"}
                    onChange={() => handleInputChange("tripType", "one-way")}
                  />
                  One-Way
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    checked={formData.tripType === "round-trip"}
                    onChange={() => handleInputChange("tripType", "round-trip")}
                  />
                  Round-Trip
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#172033]">Schedule</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    checked={formData.schedule === "one-time"}
                    onChange={() => handleInputChange("schedule", "one-time")}
                  />
                  One-Time
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    checked={formData.schedule === "recurring"}
                    onChange={() => handleInputChange("schedule", "recurring")}
                  />
                  Recurring
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Pickup Address *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.pickupAddress}
                onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Destination Address *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.destinationAddress}
                onChange={(e) => handleInputChange("destinationAddress", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Pickup Date *</label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.pickupDate}
                onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Pickup Time *</label>
              <input
                type="time"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.pickupTime}
                onChange={(e) => handleInputChange("pickupTime", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Appointment Time (Optional)</label>
              <input
                type="time"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange("appointmentTime", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Final Fixed Fare ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                placeholder="0.00"
                value={formData.fare}
                onChange={(e) => handleInputChange("fare", e.target.value)}
                required
              />
            </div>

            {/* Recurring Details */}
            {formData.schedule === "recurring" && (
              <div className="sm:col-span-2 border-t border-[#f1f3f7] pt-4 mt-2 space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#52647e] tracking-wide">Recurring Setup</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Start Date</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.recurringStartDate}
                      onChange={(e) => handleInputChange("recurringStartDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">End Date</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.recurringEndDate}
                      onChange={(e) => handleInputChange("recurringEndDate", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-[#172033]">Days of the Week</label>
                    <div className="flex flex-wrap gap-2">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                        const checked = formData.recurringDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleRecurringDay(day)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                              checked ? "bg-[#173d76] border-[#173d76] text-white" : "border-[#e1e5ea] text-[#52647e] hover:bg-slate-50"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Recurring Pickup Time</label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.recurringPickupTime}
                      onChange={(e) => handleInputChange("recurringPickupTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Recurring Appointment Time</label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.recurringAppointmentTime}
                      onChange={(e) => handleInputChange("recurringAppointmentTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Round-Trip Details */}
            {formData.tripType === "round-trip" && (
              <div className="sm:col-span-2 border-t border-[#f1f3f7] pt-4 mt-2 space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#52647e] tracking-wide">Return Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Return Pickup Address</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.returnPickupAddress}
                      onChange={(e) => handleInputChange("returnPickupAddress", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Return Destination Address</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.returnDestinationAddress}
                      onChange={(e) => handleInputChange("returnDestinationAddress", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Return Date</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange("returnDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#172033]">Return Pickup Time</label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                      value={formData.returnPickupTime}
                      onChange={(e) => handleInputChange("returnPickupTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 border-t border-[#f1f3f7] pt-4 mt-2">
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Driver Notes (Optional)</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.driverNotes}
                onChange={(e) => handleInputChange("driverNotes", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 03: Mobility & Special Needs */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">03</span>
            <h2 className="text-base font-bold text-[#172033]">Mobility & Special Needs</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#172033]">Select all that apply</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {["ambulatory", "wheelchair", "walker", "cane"].map((option) => {
                  const checked = formData.mobilityOptions.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleMobilityOption(option)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize cursor-pointer transition-colors ${
                        checked ? "bg-[#173d76] border-[#173d76] text-white" : "border-[#e1e5ea] text-[#52647e] hover:bg-slate-50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Needs help down the stairs"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Access Information</label>
                <input
                  type="text"
                  placeholder="e.g. gate code 1234"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.accessInformation}
                  onChange={(e) => handleInputChange("accessInformation", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 04: Insurance / Payment Information */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">04</span>
            <h2 className="text-base font-bold text-[#172033]">Insurance / Payment Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Insurance Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.insuranceName}
                onChange={(e) => handleInputChange("insuranceName", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Authorization Number</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.authNumber}
                onChange={(e) => handleInputChange("authNumber", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 py-1">
              <input
                id="privatePay"
                type="checkbox"
                checked={formData.privatePay}
                onChange={(e) => handleCheckboxChange("privatePay", e.target.checked)}
                className="size-4"
              />
              <label htmlFor="privatePay" className="text-xs text-[#69758a]">Private Pay (Self-Funded)</label>
            </div>
          </div>
        </div>

        {/* Section 05: Guardian Information */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">05</span>
            <h2 className="text-base font-bold text-[#172033]">Guardian Information (If Applicable)</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Guardian Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.guardianName}
                onChange={(e) => handleInputChange("guardianName", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Guardian Phone</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.guardianPhone}
                onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#172033]">Guardian Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                value={formData.guardianEmail}
                onChange={(e) => handleInputChange("guardianEmail", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 06: Consents & Agreements */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">06</span>
            <h2 className="text-base font-bold text-[#172033]">Consents & Agreements</h2>
          </div>
          <div className="space-y-3">
            {[
              { id: "consentPhoto", label: "Passenger Photo Authorization", desc: "I authorize FIKI Transit to use passenger photo for identification and safety purposes." },
              { id: "consentTransport", label: "Passenger Transportation Agreement", desc: "I agree to the terms and conditions governing non-emergency medical transportation services." },
              { id: "consentEsignature", label: "Passenger Electronic Signature Consent", desc: "I consent to the use of electronic signatures in place of traditional wet signatures." },
              { id: "consentHipaa", label: "FIKI Transit Privacy Policy (HIPAA Notice)", desc: "I acknowledge receipt of the HIPAA Notice of Privacy Practices and consent to its terms." }
            ].map((consent) => (
              <div key={consent.id} className="flex items-start gap-3 rounded-xl border border-[#e1e5ea] p-4 bg-slate-50/50">
                <input
                  id={consent.id}
                  type="checkbox"
                  checked={(formData as any)[consent.id]}
                  onChange={(e) => handleCheckboxChange(consent.id, e.target.checked)}
                  className="size-4 mt-0.5 cursor-pointer"
                  required
                />
                <div className="space-y-0.5">
                  <label htmlFor={consent.id} className="text-sm font-bold text-[#172033] cursor-pointer">
                    {consent.label} *
                  </label>
                  <p className="text-xs text-[#69758a]">{consent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 07: Signature */}
        <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#f1f3f7] pb-4 mb-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2fb] text-xs font-bold text-[#173d76]">07</span>
            <h2 className="text-base font-bold text-[#172033]">Signature</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-semibold text-[#172033]">Signature Here *</label>
              <SignaturePad
                value={formData.signature}
                onChange={(val) => handleInputChange("signature", val)}
              />
            </div>
            <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Date *</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.signatureDate}
                  onChange={(e) => handleInputChange("signatureDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Printed Name *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.printedName}
                  onChange={(e) => handleInputChange("printedName", e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#172033]">Relationship to Passenger</label>
                <input
                  type="text"
                  placeholder="e.g. Self, Parent, Case Manager"
                  className="w-full rounded-xl border border-[#e1e5ea] px-4 py-2.5 text-sm"
                  value={formData.relationshipToPassenger}
                  onChange={(e) => handleInputChange("relationshipToPassenger", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#f9b310] px-8 py-3 text-sm font-bold text-[#0b2b58] transition-colors hover:bg-[#e6a50c] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit Manual Ride Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
