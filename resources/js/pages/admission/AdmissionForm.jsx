import React, { useState } from 'react';
import { Users, GraduationCap, Bus, Receipt, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight, Upload, X, FileText, Calendar } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

const AdmissionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [file, setFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    familyPhone: '',
    familyAddress: '',
    relationshipGroup: 'Parents',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    guardianName: '',
    guardianPhone: '',
    parentType: 'Normal',
    studentName: '',
    dob: '',
    studentClass: 'Grade 1',
    transportRoute: '0',
  });

  const steps = [
    { id: 1, title: 'Family & Parents', icon: Users },
    { id: 2, title: 'Student & Docs', icon: GraduationCap },
    { id: 3, title: 'Transport', icon: Bus },
    { id: 4, title: 'Preview', icon: Receipt },
    { id: 5, title: 'Confirm', icon: CheckCircle },
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Clean up old preview URL to prevent memory leaks
      if (file?.preview) URL.revokeObjectURL(file.preview);
      
      setFile({
        file: selectedFile,
        preview: URL.createObjectURL(selectedFile),
        name: selectedFile.name,
        type: selectedFile.type
      });
    }
  };

  const removeFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
  };

  const navigateToStep = (stepId) => {
    if (stepId <= maxReachedStep) setCurrentStep(stepId);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxReachedStep) setMaxReachedStep(next);
    } else {
      alert("Success! Admission complete.");
      window.location.reload();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculateFees = () => {
    const baseFee = 25000;
    const transport = parseFloat(formData.transportRoute);
    let discount = 0;
    if (formData.parentType === "Teacher") discount = baseFee * 0.15;
    else if (formData.parentType === "Staff") discount = baseFee * 0.10;

    return {
      baseFee,
      discount,
      transport,
      total: baseFee - discount + transport
    };
  };

  const fees = calculateFees();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Admissions / New Registration</p>
            <h1 className="text-3xl font-bold">Student Enrollment</h1>
          </div>

          {/* Step Indicator */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between mb-8 overflow-x-auto gap-4 scrollbar-hide">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isVisited = step.id <= maxReachedStep;
              return (
                <button
                  key={step.id}
                  onClick={() => navigateToStep(step.id)}
                  disabled={!isVisited}
                  className={`flex items-center gap-3 transition-all flex-shrink-0 ${
                    isActive ? 'text-blue-600 cursor-pointer' : isVisited ? 'text-emerald-500 cursor-pointer' : 'text-slate-400 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white cursor-pointer' : step.id < currentStep ? 'bg-emerald-500 text-white cursor-pointer' : 'bg-slate-100'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className="hidden lg:block font-semibold text-sm">{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200 min-h-[550px]">
            
            {/* Step 1: Family & Parents */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <section>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                    <Users size={20} className="text-blue-600" />
                    <h2 className="text-lg font-bold">1. Family Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Family Primary Phone</label>
                      <input type="tel" id="familyPhone" value={formData.familyPhone} onChange={handleInputChange} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Family Home Address</label>
                      <input type="text" id="familyAddress" value={formData.familyAddress} onChange={handleInputChange} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-blue-600" />
                      <h2 className="text-lg font-bold">2. Parent Details</h2>
                    </div>
                    <select id="relationshipGroup" value={formData.relationshipGroup} onChange={handleInputChange} className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                      <option value="Parents">Parents</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.relationshipGroup === 'Parents' ? (
                      <>
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-xs font-black text-slate-500 uppercase">Father Details</label>
                          <input type="text" id="fatherName" placeholder="Full Name" value={formData.fatherName} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                          <input type="tel" id="fatherPhone" placeholder="Phone Number" value={formData.fatherPhone} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-xs font-black text-slate-500 uppercase">Mother Details</label>
                          <input type="text" id="motherName" placeholder="Full Name" value={formData.motherName} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                          <input type="tel" id="motherPhone" placeholder="Phone Number" value={formData.motherPhone} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="text-xs font-black text-slate-500 uppercase">Guardian Details</label>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input type="text" id="guardianName" placeholder="Full Name" value={formData.guardianName} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                          <input type="tel" id="guardianPhone" placeholder="Phone Number" value={formData.guardianPhone} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 p-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Parent Email</label>
                        <input type="text" id="parentEmail" placeholder="" value={formData.parentEmail} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-3 p-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Parent Type</label>
                        <select id="parentType" value={formData.parentType} onChange={handleInputChange} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none">
                            <option value="Normal">General / Normal</option>
                            <option value="Teacher">Teacher (15% Discount)</option>
                            <option value="Staff">Staff (10% Discount)</option>
                        </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Step 2: Student & Docs */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6 text-xl font-bold border-b border-slate-100 pb-4">
                  <GraduationCap className="text-blue-600" /> Student Profile
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                    <input type="text" id="studentName" value={formData.studentName} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                    <input type="date" id="dob" value={formData.dob} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Class</label>
                    <select id="studentClass" value={formData.studentClass} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none">
                      <option>Grade 1</option>
                      <option>Grade 2</option>
                      <option>Grade 3</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Year</label>
                    <div className="flex items-center gap-2 w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-semibold italic">
                        <Calendar size={14} /> 2025 - 2026
                    </div>
                  </div>
                </div>

                {/* Single Image Upload & Preview */}
                <div className="pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Student Photograph / ID</label>
                  <div className="flex items-center gap-4">
                    {!file ? (
                      <label className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all">
                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-[10px] font-bold mt-2 text-slate-500">Upload File</span>
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        {file.type.startsWith('image/') ? (
                           <img src={file.preview} alt="preview" className="w-full h-full object-cover rounded-2xl border-2 border-blue-500 shadow-md" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-blue-500">
                             <FileText size={32} className="text-blue-500" />
                             <span className="text-[8px] mt-2 px-1 truncate w-full text-center font-bold">{file.name}</span>
                           </div>
                        )}
                        <button onClick={removeFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors">
                          <X size={14} />
                        </button>
                        <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-2 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer shadow-sm hover:bg-slate-50">
                          Change
                          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                        </label>
                      </div>
                    )}
                    {!file && <p className="text-[10px] text-slate-400 italic">Please upload a clear photo of the student.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Transport */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                <div className="flex items-center gap-3 mb-8 text-xl font-bold">
                  <Bus className="text-blue-600" /> Transport Services
                </div>
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Route</label>
                    <select id="transportRoute" value={formData.transportRoute} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium">
                      <option value="0">No Transport (Self Drop-off)</option>
                      <option value="1200">Route A - Chandigarh</option>
                      <option value="1500">Route B - Panchkula</option>
                      <option value="2500">Route C - Mohali</option>
                      <option value="1000">Route D - Zirakpur</option>
                    </select>
                  </div>
                  {formData.transportRoute !== "0" && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Transport Fee</span>
                      <span className="font-bold text-blue-900 text-lg">₹{parseFloat(formData.transportRoute).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6 text-xl font-bold">
                  <Receipt className="text-blue-600" /> Fee Summary
                </div>
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 max-w-full mx-auto md:mx-0">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Admission Fee</span>
                        <span className="font-bold">₹{fees.baseFee.toLocaleString()}</span>
                    </div>
                    {fees.discount > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                            <span className="font-medium italic">Discount ({formData.parentType})</span>
                            <span className="font-bold">- ₹{fees.discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Transport Facility</span>
                        <span className="font-bold">{fees.transport > 0 ? `₹${fees.transport.toLocaleString()}` : "N/A"}</span>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-end">
                        <div>
                            <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-blue-600 leading-none">₹{fees.total.toLocaleString()}</span>
                             <p className="text-[10px] text-slate-400 italic">One-time payment</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Finalize */}
            {currentStep === 5 && (
              <div className="animate-in zoom-in-95 text-center py-10">
                <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><CheckCircle size={32} /></div></div>
                <h2 className="text-2xl font-bold mb-2">Ready to Submit?</h2>
                <p className="text-slate-500 text-sm">Review all information for <span className="font-bold text-slate-800">{formData.studentName || "the student"}</span> before finalizing.</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
              <button onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-0 bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={nextStep} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer ${currentStep === 5 ? 'bg-emerald-500' : 'bg-[#faae1c]'}`}>
                {currentStep === 4 ? "Review Final" : currentStep === 5 ? "Submit Admission" : "Continue"}
                {currentStep < 5 && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdmissionForm;