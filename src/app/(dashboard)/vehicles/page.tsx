"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  CarFront,
  CheckCircle2,
  CreditCard,
  Hash,
  Info,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  getVehiclesApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
} from "@/lib/api";

interface VehicleItem {
  _id: string;
  modelName: string;
  licensePlate: string;
  vin: string;
  year: number;
  fleetId: string;
  status: string;
  plateExpirationDate?: string;
  createdAt: string;
}

export default function VehiclesPage() {
  const [modelName, setModelName] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [vinNumber, setVinNumber] = useState("");
  const [year, setYear] = useState("");
  const [plateExpirationDate, setPlateExpirationDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  const fetchVehicles = () => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getVehiclesApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data)) {
            setVehicles(res.data);
          }
        });
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!modelName || !numberPlate || !vinNumber || !year || !plateExpirationDate) {
      setErrorMsg("All fields are required to proceed.");
      return;
    }

    if (vinNumber.length !== 17) {
      setErrorMsg("VIN must contain exactly 17 characters.");
      return;
    }

    const yearNum = Number(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setErrorMsg("Please enter a valid manufacturing year.");
      return;
    }

    setLoading(true);
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        let res;
        if (editingId) {
          res = await updateVehicleApi(token, editingId, {
            modelName,
            licensePlate: numberPlate,
            vin: vinNumber,
            year: yearNum,
            plateExpirationDate,
          });
        } else {
          res = await createVehicleApi(token, {
            modelName,
            licensePlate: numberPlate,
            vin: vinNumber,
            year: yearNum,
            plateExpirationDate,
          });
        }

        if (res.success) {
          setSuccessMsg(editingId ? "Vehicle updated successfully!" : "Vehicle added successfully!");
          handleCancel();
          fetchVehicles();
        } else {
          setErrorMsg(res.error?.message || "Failed to process vehicle request.");
        }
      }
    }
    setLoading(false);
  };

  const handleEditInit = (v: VehicleItem) => {
    setEditingId(v._id);
    setModelName(v.modelName);
    setNumberPlate(v.licensePlate);
    setVinNumber(v.vin);
    setYear(String(v.year));
    setPlateExpirationDate(v.plateExpirationDate || "");
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        const res = await deleteVehicleApi(token, id);
        if (res.success) {
          setSuccessMsg("Vehicle deleted successfully!");
          if (editingId === id) {
            handleCancel();
          }
          fetchVehicles();
        } else {
          setErrorMsg(res.error?.message || "Failed to delete vehicle.");
        }
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setModelName("");
    setNumberPlate("");
    setVinNumber("");
    setYear("");
    setPlateExpirationDate("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="text-xs text-muted-foreground">
          Dashboard &gt; <span className="font-semibold text-foreground">{editingId ? "Edit Vehicle" : "Add Vehicle"}</span>
        </nav>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <CarFront className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{editingId ? "Edit Vehicle" : "Add Vehicle"}</h1>
            <p className="text-xs text-muted-foreground">
              {editingId ? "Update vehicle details in the fleet" : "Add a new vehicle to the fleet"}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Information Form Card */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-7">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-amber-500" />
            <h2 className="text-base font-bold text-foreground">
              {editingId ? "Edit Vehicle Information" : "Vehicle Information"}
            </h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" />
            {editingId ? "Editing Mode" : "Ready to Add"}
          </span>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-600">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Model Name */}
            <div>
              <label className="block text-xs font-bold text-foreground">Model Name</label>
              <input
                type="text"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Enter vehicle model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>

            {/* Number Plate */}
            <div>
              <label className="block text-xs font-bold text-foreground">Number Plate</label>
              <input
                type="text"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Enter vehicle number plate"
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
              />
            </div>

            {/* VIN Number */}
            <div>
              <label className="block text-xs font-bold text-foreground">VIN Number</label>
              <input
                type="text"
                maxLength={17}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Enter VIN number"
                value={vinNumber}
                onChange={(e) => setVinNumber(e.target.value)}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {vinNumber.length}/17 characters — VIN must contain 17 characters.
              </p>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-foreground">Year</label>
              <input
                type="number"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Enter manufacturing year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Enter the vehicle manufacturing year.
              </p>
            </div>

            {/* Plate Expiration Date */}
            <div>
              <label className="block text-xs font-bold text-foreground">Plate Expiration Date</label>
              <input
                type="date"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                value={plateExpirationDate}
                onChange={(e) => setPlateExpirationDate(e.target.value)}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Select plate expiration date.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 text-muted-foreground" />
              All fields are required to proceed.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 rounded-xl border border-border bg-card px-5 text-xs font-bold text-foreground hover:bg-muted"
              >
                {editingId ? "Cancel Edit" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-6 text-xs font-bold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
              >
                <PlusCircle className="size-4" />
                {loading ? "Processing..." : editingId ? "Save Changes" : "Add Vehicle"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Vehicles Cards List */}
      <section className="grid gap-5 md:grid-cols-2">
        {vehicles.map((v) => (
          <article
            key={v._id}
            className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_22px_rgba(8,37,82,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
                  <Car className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{v.modelName}</h3>
                  <p className="text-xs font-semibold text-emerald-600">
                    ● {v.status || "Active"} — Fleet ID {v.fleetId || "#327"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Edit Vehicle"
                  onClick={() => handleEditInit(v)}
                  className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-amber-500/50 hover:bg-amber-50 hover:text-amber-600"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  title="Delete Vehicle"
                  onClick={() => handleDelete(v._id)}
                  className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-rose-500/50 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-4" />
                </button>
                <span className="ml-1 rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  NEW
                </span>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <CarFront className="size-3.5" />
                  NUMBER PLATE
                </dt>
                <dd className="mt-1 font-bold text-foreground">{v.licensePlate}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="size-3.5" />
                  YEAR
                </dt>
                <dd className="mt-1 font-bold text-foreground">{v.year}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  VIN NUMBER
                </dt>
                <dd className="mt-1 font-bold text-foreground">{v.vin}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  DATE ADDED
                </dt>
                <dd className="mt-1 font-bold text-foreground">
                  {v.createdAt
                    ? new Date(v.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "11 Aug 2026"}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="size-3.5" />
                  PLATE EXPIRATION
                </dt>
                <dd className="mt-1 font-bold text-foreground">
                  {v.plateExpirationDate
                    ? new Date(v.plateExpirationDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })
                    : "—"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
