"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, ExternalLink, Search, ShieldCheck, Stethoscope } from "lucide-react";

type Doctor = { 
  id: string; 
  name: string; 
  specialization: string; 
  initials?: string; 
  accent?: string; 
  nextAvailable?: string 
};

type Slot = { startTime: string; endTime: string; label: string; startMinute: number };

const today = new Date().toISOString().slice(0, 10);

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialization, setSpecialization] = useState("All specialties");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch live doctors from your API route on page load
  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data: Doctor[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((doc) => ({
            ...doc,
            initials: doc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            accent: "bg-[#e5f0ea] text-[#27604b]",
            nextAvailable: "Available",
          }));
          setDoctors(formatted);
          setSelectedDoctor(formatted[0]);
        }
      })
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetch(`/api/doctors/${selectedDoctor.id}/availability?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data: Slot[]) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]));
  }, [selectedDate, selectedDoctor]);

  const filteredDoctors = useMemo(() => 
    specialization === "All specialties" 
      ? doctors 
      : doctors.filter((doctor) => doctor.specialization === specialization), 
    [specialization, doctors]
  );

  async function bookAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    setStatus(null);
    if (!selectedDoctor) return;
    
    if (!selectedSlot) return;
    
    const response = await fetch("/api/appointments", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ doctorId: selectedDoctor.id, patientName, patientEmail, message, appointmentDate: selectedDate, startMinute: selectedSlot.startMinute, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime }) 
    });
    
    const result = await response.json(); 
    setStatus({ 
      type: response.ok ? "success" : "error", 
      message: response.ok ? `Appointment confirmed with ${selectedDoctor.name}.` : result.error 
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f9f7] text-[#20322a]">
      <header className="border-b border-[#dce6df] bg-[#fbfdfb]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#27604b] text-white">
              <Stethoscope size={19} />
            </div>
            <span className="font-semibold tracking-tight">Appointment<span className="text-[#72a889]">.</span>Scheduler</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#66766d]">
            <span className="hidden sm:inline">Patient portal</span>
            <div className="size-8 rounded-full bg-[#d5e4d9] text-center pt-1.5 text-xs font-semibold text-[#27604b]">JD</div>
          </div>
        </div>
      </header>
      
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-10 lg:pt-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#579172]">Your care, on your time</p>
          <h1 className="font-serif text-5xl leading-[1.03] tracking-[-0.04em] text-[#1d3b2d] sm:text-6xl">
            Make space for<br /><em className="font-normal text-[#579172]">feeling better.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#68776f]">Find a trusted specialist and reserve a time that works for you. Your next appointment is a few simple steps away.</p>
        </div>
      </section>
      
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="rounded-2xl border border-[#dce6df] bg-white p-5 shadow-[0_16px_50px_rgba(38,80,60,0.06)] sm:p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 01</p>
              <h2 className="mt-1 text-xl font-semibold">Choose your specialist</h2>
            </div>
            <span className="rounded-full bg-[#f0f6f1] px-3 py-1 text-xs font-medium text-[#579172]">
              {doctors.length} doctors available
            </span>
          </div>
          
          <label className="relative block">
            <Search className="absolute left-3.5 top-3.5 text-[#8b9a91]" size={18} />
            <select 
              value={specialization} 
              onChange={(event) => setSpecialization(event.target.value)} 
              className="w-full appearance-none rounded-xl border border-[#dce6df] bg-[#fbfdfb] py-3 pl-11 pr-10 text-sm outline-none focus:border-[#579172]"
            >
              <option>All specialties</option>
              <option>Cardiology</option>
              <option>General medicine</option>
              <option>Dermatology</option>
              <option>Computer Health</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 text-[#8b9a91]" size={18} />
          </label>
          
          <div className="mt-5 space-y-3">
            {filteredDoctors.map((doctor) => (
              <button 
                type="button" 
                key={doctor.id} 
                onClick={() => { setSelectedDoctor(doctor); setSelectedSlot(null); }} 
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selectedDoctor?.id === doctor.id ? "border-[#579172] bg-[#f3f8f4]" : "border-[#e6ece8] hover:border-[#b8cfc0]"}`}
              >
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${doctor.accent}`}>
                  {doctor.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{doctor.name}</p>
                  <p className="mt-0.5 text-sm text-[#7c8b82]">{doctor.specialization}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-[#91a097]">Next available</p>
                  <p className="mt-0.5 text-sm font-medium text-[#4b6758]">{doctor.nextAvailable}</p>
                </div>
                <div className={`flex size-5 items-center justify-center rounded-full border ${selectedDoctor?.id === doctor.id ? "border-[#579172] bg-[#579172] text-white" : "border-[#c8d6cc]"}`}>
                  {selectedDoctor?.id === doctor.id && <Check size={13} />}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-[#dce6df] bg-[#edf5ef] p-5 sm:p-7">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 02</p>
            <h2 className="mt-1 text-xl font-semibold">Find a time</h2>
          </div>
          
          <div className="flex items-center justify-between rounded-xl border border-[#d5e3d8] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-[#579172]" size={18} />
              <div>
                <label className="block text-sm font-medium">
                  <span className="sr-only">Choose appointment date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={(event) => { setSelectedDate(event.target.value); setSelectedSlot(null); }}
                    className="bg-transparent outline-none"
                  />
                </label>
                <p className="text-xs text-[#84948a]">45 minute consultation</p>
              </div>
            </div>
            <ArrowRight className="text-[#9caf9f]" size={17} />
          </div>
          
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {slots.map((slot) => (
              <button 
                type="button" 
                key={slot.startTime}
                onClick={() => setSelectedSlot(slot)} 
                className={`rounded-lg border px-2 py-3 text-sm transition ${selectedSlot?.startTime === slot.startTime ? "border-[#27604b] bg-[#27604b] text-white" : "border-[#d5e3d8] bg-white text-[#4d6959] hover:border-[#579172]"}`}
              >
                <Clock3 className="mr-1 inline" size={13} />{slot.label}
              </button>
            ))}
            {slots.length === 0 && (
              <p className="col-span-full rounded-lg border border-dashed border-[#c8d9cc] px-4 py-5 text-center text-sm text-[#718279]">
                No open appointments for this doctor on this date.
              </p>
            )}
          </div>
          
          <div className="mt-7 border-t border-[#d5e3d8] pt-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 03 · Your details</p>
            <form onSubmit={bookAppointment} className="space-y-3">
              <input 
                required 
                minLength={2} 
                value={patientName} 
                onChange={(event) => setPatientName(event.target.value)} 
                placeholder="Full name" 
                className="w-full rounded-lg border border-[#d5e3d8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9aa9a0] focus:border-[#579172]" 
              />
              <input 
                required 
                type="email" 
                value={patientEmail} 
                onChange={(event) => setPatientEmail(event.target.value)} 
                placeholder="Email address" 
                className="w-full rounded-lg border border-[#d5e3d8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9aa9a0] focus:border-[#579172]" 
              />
              <textarea
                required
                minLength={2}
                maxLength={500}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What would you like to book this appointment for?"
                rows={3}
                className="w-full resize-none rounded-lg border border-[#d5e3d8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9aa9a0] focus:border-[#579172]"
              />
              <button disabled={!selectedSlot} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#27604b] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4939] disabled:cursor-not-allowed disabled:opacity-50">
                Confirm appointment <ArrowRight size={16} />
              </button>
            </form>
            
            {status && (
              <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${status.type === "success" ? "border-[#b9dcc4] bg-[#eff9f1] text-[#27604b]" : "border-[#ebc5b7] bg-[#fff4ef] text-[#a14f34]"}`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <footer className="border-t border-[#dce6df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-[#84948a] lg:px-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#579172]" /> Your health information is protected and private.
          </div>
          <p>This is a sample project by Tamzid Idrish, not an official page of any hospital. This page features Next.js, TypeScript, React, Tailwind CSS, Prisma, PostgreSQL, and Zod.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Tamzid Idrish</span>
            <a href="https://github.com/the3rd-dimension/clinic-appointment-scheduler-t3d.git" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-lg border border-[#c8d9cc] px-3 py-2 font-medium text-[#27604b] transition hover:bg-[#f0f6f1]">
              <ExternalLink size={15} /> View the project on GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}