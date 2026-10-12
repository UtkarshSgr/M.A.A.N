"use client";

import React, { useState, useEffect } from 'react';
import {
    QrCode,
    Search,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    AlertTriangle,
    AlertOctagon,
    MapPin,
    Send,
    X,
    FileWarning,
    Check
} from 'lucide-react';

const COMMON_ISSUES = [
    'Broken Hardware Seal',
    'Display Screen Hidden',
    'Weighing Seems Inaccurate',
    'Other (Manual Entry)'
] as const;

type CommonIssue = typeof COMMON_ISSUES[number];

export default function CitizenPublicAudit() {
    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
    const [inputValue, setInputValue] = useState('');

    // Verification state
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyingMode, setVerifyingMode] = useState<'valid' | 'tampered' | null>(null);
    const [resultState, setResultState] = useState<'valid' | 'tampered' | null>(null);

    // Complaint Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<CommonIssue>('Broken Hardware Seal');
    const [customRemarks, setCustomRemarks] = useState('');
    const [includeGps, setIncludeGps] = useState(true);

    // Toast and Ticket State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [ticketNumber, setTicketNumber] = useState<string | null>(null);

    // Auto-dismiss toast after 5 seconds
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Smart Input Detection Logic for manual lookup
    const getHelperText = () => {
        if (!inputValue) return "Enter an ID to auto-detect format.";
        const upperVal = inputValue.toUpperCase();
        if (upperVal.includes('TAMPER') || upperVal.includes('8839201')) {
            return "Detected flagged device serial: 8839201-X (Will trigger alert).";
        }
        if (upperVal.startsWith('HL-')) return "Searching by Hologram ID...";
        if (inputValue.length > 15 || /^[0-9a-f]{8}-/i.test(inputValue)) return "Searching by Digital Token...";
        return "Searching by Device Serial Number...";
    };

    // Verification handler
    const handleVerify = (mode: 'valid' | 'tampered') => {
        setIsVerifying(true);
        setVerifyingMode(mode);
        setTimeout(() => {
            setIsVerifying(false);
            setVerifyingMode(null);
            setResultState(mode);
        }, 1200);
    };

    const handleManualVerify = () => {
        if (!inputValue) return;
        const upper = inputValue.toUpperCase();
        // If query has tamper, fail, or the tampered device serial 8839201, show tampered state
        if (upper.includes('TAMPER') || upper.includes('FAIL') || upper.includes('8839201') || upper.includes('INVALID')) {
            handleVerify('tampered');
        } else {
            handleVerify('valid');
        }
    };

    const resetAudit = () => {
        setResultState(null);
        setInputValue('');
        setIsModalOpen(false);
    };

    const handleSubmitComplaint = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsModalOpen(false);
        setTicketNumber('1042');
        setToastMessage('Ticket #1042 Sent to Local LMO');
    };

    return (
        <div className="relative font-sans">
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-emerald-950/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-start gap-3.5 animate-in slide-in-from-bottom-5 fade-in duration-200"
                >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-white tracking-tight">{toastMessage}</p>
                        <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                            Auto-dispatched to Circle 4 Inspector. Geo-coordinates &amp; merchant serial logged in Legal Metrology Enforcement Registry.
                        </p>
                    </div>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="text-emerald-300 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* MODAL: REPORT DISCREPANCY */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-headline"
                        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
                    >
                        {/* Modal Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FileWarning className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <h3 id="modal-headline" className="text-lg sm:text-xl font-bold text-zinc-900 leading-tight">
                                        Report Issue to Legal Metrology
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Discrepancy notice filed under Legal Metrology Act, 2009
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-zinc-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitComplaint} className="p-6 space-y-5 overflow-y-auto">
                            {/* Quick-Select Issue Pills */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                                    Select Observed Issue (Choose one)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {COMMON_ISSUES.map((issue) => {
                                        const isSelected = selectedIssue === issue;
                                        return (
                                            <button
                                                key={issue}
                                                type="button"
                                                onClick={() => setSelectedIssue(issue)}
                                                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left flex items-center justify-between border cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 font-semibold shadow-xs'
                                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="truncate pr-1">{issue}</span>
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-rose-600 border-rose-600 text-white'
                                                            : 'border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Expandable Remarks if "Other" is chosen */}
                                {selectedIssue === 'Other (Manual Entry)' && (
                                    <div className="mt-3 animate-in fade-in duration-150">
                                        <textarea
                                            value={customRemarks}
                                            onChange={(e) => setCustomRemarks(e.target.value)}
                                            placeholder="Provide specific observations (e.g., negative tare reading, calibration seal absent)..."
                                            rows={2}
                                            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Auto-Tagged Context Block */}
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-start gap-2.5">
                                <span className="text-base select-none leading-none mt-0.5">📍</span>
                                <div className="leading-relaxed">
                                    Auto-tagging report to: <span className="font-semibold text-zinc-900">Kerala Supermart, Kozhikode</span>{" "}
                                    <span className="text-slate-500 font-mono text-xs block sm:inline">(Device SN: 8839201-X).</span>
                                </div>
                            </div>

                            {/* Location Toggle */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                <label
                                    htmlFor="gps-toggle"
                                    className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-zinc-800 select-none flex-1 pr-3"
                                >
                                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span>Include precise GPS coordinates</span>
                                </label>
                                <button
                                    type="button"
                                    id="gps-toggle"
                                    role="switch"
                                    aria-checked={includeGps}
                                    onClick={() => setIncludeGps(!includeGps)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        includeGps ? 'bg-emerald-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            includeGps ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {includeGps && (
                                <p className="text-[11px] text-emerald-700 font-medium px-1 flex items-center gap-1.5 -mt-2">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Lat: 11.2588° N, Long: 75.7804° E • Calibrated accuracy ±3m</span>
                                </p>
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full h-12 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit Report
                                </button>
                                <p className="text-[11px] text-center text-slate-400 mt-2">
                                    Forwarded securely to District Metrology Enforcement Console
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: SUCCESS RESULT STATE                                              */}
            {/* ========================================================================= */}
            {resultState === 'valid' && (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden font-sans p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Scale Verified</h2>
                        <p className="text-sm text-emerald-600 font-semibold mb-6 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> Hardware Binding Authentic
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 mb-6 text-sm">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Merchant</span>
                            <span className="font-semibold text-zinc-900">Kerala Supermart, Kozhikode</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Device SN</span>
                            <span className="font-mono font-semibold text-zinc-900">8839201-A</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Calibration Valid Till</span>
                            <span className="font-semibold text-emerald-700">15 Dec 2027</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Inspecting LMO</span>
                            <span className="font-semibold text-zinc-900">Circle 4 - Kerala Legal Metrology</span>
                        </div>
                    </div>

                    <button
                        onClick={resetAudit}
                        className="w-full h-12 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Scan Another Scale
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: TAMPERED RESULT STATE                                             */}
            {/* ========================================================================= */}
            {resultState === 'tampered' && (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-rose-300 ring-1 ring-rose-500/10 overflow-hidden font-sans p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-xs">
                            <AlertTriangle className="w-8 h-8 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Scale Invalid or Tampered</h2>
                        <p className="text-sm text-rose-600 font-semibold mb-6 flex items-center justify-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" /> Statutory Security Breach Detected
                        </p>
                    </div>

                    {/* Warning Callout Box */}
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-rose-800 flex items-start gap-3">
                        <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <strong className="font-bold">Statutory Alert:</strong> Commercial weighing scale failed 3-layer anti-fraud binding. Hologram verification key is expired and seal integrity is compromised under Section 24 of the Legal Metrology Act, 2009.
                        </div>
                    </div>

                    {/* Discrepancy Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 mb-6 text-sm">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Merchant</span>
                            <span className="font-semibold text-zinc-900">Kerala Supermart, Kozhikode</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Device SN</span>
                            <span className="font-mono font-semibold text-zinc-900">8839201-X</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Calibration Status</span>
                            <span className="font-bold text-rose-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-pulse"></span>
                                Expired (14 Aug 2024)
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Hardware Seal</span>
                            <span className="font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded text-xs">
                                TAMPERED / SEAL BROKEN
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Inspecting LMO</span>
                            <span className="font-semibold text-zinc-900">Circle 4 - Kerala Legal Metrology</span>
                        </div>
                    </div>

                    {/* Complaint confirmation if ticket is active */}
                    {ticketNumber && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-5 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                                <strong>Ticket #{ticketNumber} active:</strong> Discrepancy report recorded with local Circle 4 LMO inspection team.
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="w-full h-12 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:bg-rose-800 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm sm:text-base"
                        >
                            <AlertTriangle className="w-4 h-4 text-white" />
                            Report Discrepancy
                        </button>

                        <button
                            type="button"
                            onClick={resetAudit}
                            className="w-full h-11 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Scan Another Scale
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: DEFAULT SEARCH & QR SCANNER UI                                    */}
            {/* ========================================================================= */}
            {!resultState && (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
                    <div className="p-6 sm:p-8 pb-6 text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Citizen Public Audit</h2>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">
                            Instantly verify the statutory calibration and 3-layer anti-fraud hardware binding of any commercial weighing scale.
                        </p>
                    </div>

                    <div className="px-6 sm:px-8 pb-6">
                        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-md mx-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('scan')}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'scan' ? 'bg-white text-zinc-900 shadow-sm' : 'text-slate-500 hover:text-zinc-700'
                                }`}
                            >
                                <QrCode className="w-4 h-4" /> Scan QR Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'manual' ? 'bg-white text-zinc-900 shadow-sm' : 'text-slate-500 hover:text-zinc-700'
                                }`}
                            >
                                <Search className="w-4 h-4" /> Manual Lookup
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 p-6 sm:p-8">
                        {activeTab === 'scan' && (
                            <div className="animate-in fade-in duration-300 max-w-md mx-auto space-y-4">
                                <div className="bg-slate-50 shadow-inner rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center border border-slate-200 min-h-[260px]">
                                    <div className="w-48 h-48 border-2 border-dashed border-emerald-500 rounded-xl relative flex items-center justify-center bg-white/60">
                                        <QrCode className="w-10 h-10 text-emerald-600 opacity-40" />
                                    </div>
                                    <p className="text-sm text-slate-500 mt-6 font-medium text-center">
                                        Align the Holographic QR sticker inside the frame
                                    </p>
                                </div>

                                {/* Simulation Buttons: Green (Valid) and Red (Expired/Tampered) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleVerify('valid')}
                                        disabled={isVerifying}
                                        className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 text-xs sm:text-sm cursor-pointer"
                                    >
                                        {isVerifying && verifyingMode === 'valid' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <QrCode className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isVerifying && verifyingMode === 'valid'
                                                ? 'Verifying...'
                                                : 'Simulate Successful QR Scan'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleVerify('tampered')}
                                        disabled={isVerifying}
                                        className="w-full min-h-[48px] py-3 px-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 active:bg-rose-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 text-xs sm:text-sm cursor-pointer"
                                    >
                                        {isVerifying && verifyingMode === 'tampered' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isVerifying && verifyingMode === 'tampered'
                                                ? 'Checking Seal...'
                                                : 'Simulate Expired/Tampered Scan'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'manual' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto py-6">
                                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                    Device Identifier
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleManualVerify();
                                        }}
                                        placeholder="Enter ID from physical sticker (e.g., 8839201-X)"
                                        className="flex-1 h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleManualVerify}
                                        disabled={!inputValue || isVerifying}
                                        className="h-12 w-28 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm"
                                    >
                                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-slate-500 transition-all duration-200">
                                        {getHelperText()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInputValue('HL-99214-KL');
                                                handleVerify('valid');
                                            }}
                                            className="text-[11px] text-emerald-700 hover:underline font-medium"
                                        >
                                            Demo Valid
                                        </button>
                                        <span className="text-slate-300 text-xs">•</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInputValue('8839201-X');
                                                handleVerify('tampered');
                                            }}
                                            className="text-[11px] text-rose-600 hover:underline font-medium"
                                        >
                                            Demo Tampered
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}