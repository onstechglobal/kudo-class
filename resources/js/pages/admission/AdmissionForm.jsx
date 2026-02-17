import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap, Bus, Receipt, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight, MapPin, Calculator, AlertCircle } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Input from '../../components/form/Input';
import { Calendar } from 'lucide-react';


const AdmissionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [classes, setClasses] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [classFees, setClassFees] = useState([]);

  const [formData, setFormData] = useState({
    familyPhone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    guardian1Name: '',
    guardian1Phone: '',
    guardian1Email: '',
    guardian2Name: '',
    guardian2Phone: '',
    parentEmail: '',
    parentType: 'Normal',
    studentName: '',
    lastName: '',
    dob: '',
    studentClass: '',
    policy_id: '',
    bloodGroup: '',
    transportRoute: '0',
  });


  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const schoolId = storedUser?.school_id;

  useEffect(() => {
    if (!schoolId) return;
    const fetchInitialData = async () => {
      try {
        const [classRes, policyRes] = await Promise.all([
          axios.get("api/get-classes", { params: { school_id: schoolId } }),
          axios.get("api/get-fee-policies", { params: { school_id: schoolId } })
        ]);

        setClasses(Array.isArray(classRes.data.data)
          ? classRes.data.data.map(c => ({ label: c.class_name, value: c.class_id }))
          : []
        );
        setPolicies(policyRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchInitialData();
  }, [schoolId]);


  useEffect(() => {
    if (!formData.studentClass || !schoolId) return;
    const fetchClassFees = async () => {
      try {
        const res = await axios.get("api/get-class-fees", {
          params: { class_id: formData.studentClass, school_id: schoolId }
        });
        setClassFees(res.data.data || []);
      } catch (err) {
        console.error("Error fetching class fees:", err);
      }
    };
    fetchClassFees();
  }, [formData.studentClass, schoolId]);


  const steps = [
    { id: 1, title: 'Family & Guardians', icon: Users },
    { id: 2, title: 'Student & Fees', icon: GraduationCap },
    { id: 3, title: 'Transport', icon: Bus },
    { id: 4, title: 'Preview', icon: Receipt },
    { id: 5, title: 'Confirm', icon: CheckCircle },
  ];


  const calculateFees = () => {
    let academicBase = 0;

    classFees.forEach(fee => {
      const baseAmount = parseFloat(fee.amount) || 0;

      if (fee.frequency === 'monthly' && fee.end_date) {
        const today = new Date();
        const sessionEnd = new Date(fee.end_date);

        let monthsCount = (sessionEnd.getFullYear() - today.getFullYear()) * 12;
        monthsCount += sessionEnd.getMonth() - today.getMonth() + 1;

        const actualMonths = Math.max(0, monthsCount);

        academicBase += baseAmount * actualMonths;
      } else {
        academicBase += baseAmount;
      }
    });

    const transport = parseFloat(formData.transportRoute) || 0;
    let discount = 0;
    if (formData.parentType === "Teacher") discount = academicBase * 0.15;
    else if (formData.parentType === "Staff") discount = academicBase * 0.10;
    return {
      academicBase,
      discount,
      transport,
      total: academicBase - discount + transport
    };
  };


  const fees = calculateFees();

  const validateField = (name, value, isSubmit = false) => {
    let error = null;
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'familyPhone':
      case 'guardian1Phone':
        if (!value) {
          error = "Phone number is required";
        } else if (!isSubmit && value.length > 0 && value.length < 10) {
          // While typing: be quiet
          error = null;
        } else if (value.length !== 10) {
          // On submit OR if they stop typing at the wrong length: show error
          error = "Phone number must be exactly 10 digits";
        }
        break;

      case 'guardian2Phone':
        if (value && value.length > 0 && value.length < 10 && !isSubmit) {
          error = null;
        } else if (value && value.length !== 10) {
          error = "Guardian phone must be 10 digits";
        }
        break;

      case 'guardian1Email':
        if (!value) error = "Guardian email is required";
        else if (!emailRegex.test(value)) error = "Please enter a valid email address";
        break;

      case 'guardian1Name':
        if (!value) error = "Guardian name is required";
        break;

      case 'studentName':
        if (!value) error = "Student name is required";
        break;

      case 'address_line1':
        if (!value) error = "Address line 1 is required";
        break;

      case 'city':
        if (!value) error = "City is required";
        break;

      case 'pincode':
        if (value && value.length !== 6) error = "Pincode must be 6 digits";
        break;

      case 'studentClass':
        if (!value) error = "Please select a class";
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };


  const validateStep = (step) => {
    let isValid = true;
    if (step === 1) {
      const fields = ['familyPhone', 'address_line1', 'city', 'guardian1Name', 'guardian1Phone', 'guardian1Email', 'guardian2Phone'];
      fields.forEach(f => {
        // Pass "true" here so it catches the 8-digit phone numbers
        if (!validateField(f, formData[f], true)) isValid = false;
      });
    }
    if (step === 2) {
      const fields = ['studentName', 'studentClass'];
      fields.forEach(f => {
        if (!validateField(f, formData[f], true)) isValid = false;
      });
    }
    return isValid;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['familyPhone', 'guardian1Phone', 'guardian2Phone', 'pincode'].includes(name)) {
      newValue = value.replace(/[^0-9]/g, '');
      if (name === 'pincode' && newValue.length > 6) return;
      if (name.includes('Phone') && newValue.length > 10) return;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxReachedStep) setMaxReachedStep(next);
    } else {
      try {
        setIsSubmitting(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.post(`api/admissions`, {
          ...formData,
          school_id: user.school_id,
          fee_summary: fees,
          fee_details: classFees
        });
        if (response.data.success) {
          alert("Success! Admission complete.");
          window.location.reload();
        }
      } catch (err) {
        alert("Submission failed.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Admissions / 2026-27</p>
            <h1 className="text-3xl font-bold">Student Enrollment</h1>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between mb-8 overflow-x-auto gap-4 scrollbar-hide">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isVisited = step.id <= maxReachedStep;
              return (
                <button
                  key={step.id}
                  onClick={() => isVisited && setCurrentStep(step.id)}
                  disabled={!isVisited}
                  className={`flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer disabled:cursor-not-allowed ${isActive ? 'text-blue-600' : isVisited ? 'text-emerald-500' : 'text-slate-400 opacity-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : step.id < currentStep ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="hidden lg:block font-semibold text-sm">{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200 min-h-[550px]">
            {/* STEP 1: FAMILY & GUARDIANS */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <section>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                    <MapPin size={20} className="text-blue-600" />
                    <h2 className="text-lg font-bold">1. Family & Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Family Phone"
                      name="familyPhone"
                      placeholder="Primary Contact"
                      value={formData.familyPhone}
                      onChange={handleChange}
                      error={errors.familyPhone}
                    />
                    <Input
                      label="Address Line 1"
                      name="address_line1"
                      placeholder="House No / Street"
                      value={formData.address_line1}
                      onChange={handleChange}
                      error={errors.address_line1}
                    />
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                    />
                    <Input
                      label="Pincode"
                      name="pincode"
                      placeholder="6-digit"
                      value={formData.pincode}
                      onChange={handleChange}
                      error={errors.pincode}
                    />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <h2 className="text-lg font-bold">2. Guardian Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-6 bg-white-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-slate-500 uppercase">Guardian 1 *</label>

                      </div>
                      <Input
                        label="Full Name"
                        name="guardian1Name"
                        value={formData.guardian1Name}
                        onChange={handleChange}
                        error={errors.guardian1Name}
                      />
                      <Input
                        label="Phone"
                        name="guardian1Phone"
                        placeholder="10-digit Phone"
                        value={formData.guardian1Phone}
                        onChange={handleChange}
                        error={errors.guardian1Phone}
                      />
                      <Input
                        label="Email"
                        type="email"
                        name="guardian1Email"
                        placeholder="Email Address"
                        value={formData.guardian1Email}
                        onChange={handleChange}
                        error={errors.guardian1Email}
                      />
                    </div>

                    <div className="space-y-3 p-6 bg-white-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-slate-500 uppercase">Guardian 2</label>

                      </div>
                      <Input
                        label="Full Name"
                        name="guardian2Name"
                        value={formData.guardian2Name}
                        onChange={handleChange}
                      />
                      <Input
                        label="Phone"
                        name="guardian2Phone"
                        placeholder="10-digit Phone"
                        value={formData.guardian2Phone}
                        onChange={handleChange}
                        error={errors.guardian2Phone}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 2: STUDENT & FEES */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6 text-xl font-bold border-b border-slate-100 pb-4">
                  <GraduationCap className="text-blue-600" /> Student Profile & Fees
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <Input
                    label="Student Name"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    error={errors.studentName}
                  />

                  <div className="space-y-2 col-span-ful">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Date of Birth</label>
                    <div className="relative">
                      {/* The Icon */}
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <DatePicker
                        selected={formData.dob ? new Date(formData.dob) : null}
                        onChange={(date) => {
                          handleChange({
                            target: { name: "dob", value: date ? date.toISOString().split('T')[0] : "" }
                          });
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select Date"
                        maxDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        wrapperClassName="w-full"
                        className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-medium outline-none bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Admission Class</label>
                    <select
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none transition-all ${errors.studentClass ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    {errors.studentClass && <p className="text-xs font-bold text-red-600">{errors.studentClass}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Fee Category</label>
                    <select
                      name="parentType"
                      value={formData.parentType}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none bg-gray-50 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="Normal">General</option>
                      <option value="Teacher">Teacher (15% Disc)</option>
                      <option value="Staff">Staff (10% Disc)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Fee Policy</label>
                    <select
                      name="policy_id"
                      value={formData.policy_id}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none bg-gray-50 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">Select Policy</option>
                      {policies.map(p => <option key={p.policy_id} value={p.policy_id}>{p.policy_name}</option>)}
                    </select>
                  </div>

                </div>

                {/* ------------------- dynamic fees section ------------------*/}
                {classFees.length > 0 && (
                  <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold"><Calculator size={18} /> Applicable Fees for Class</div>
                    <div className="space-y-3">
                      {/* Inside Step 2 Fee Section */}
                      {classFees.map((fee, idx) => {
                        const isMonthly = fee.frequency === 'monthly';
                        let displayAmount = parseFloat(fee.amount);
                        let monthText = "";

                        if (isMonthly && fee.end_date) {
                          const today = new Date();
                          const sessionEnd = new Date(fee.end_date);
                          const months = Math.max(0, (sessionEnd.getFullYear() - today.getFullYear()) * 12 + (sessionEnd.getMonth() - today.getMonth() + 1));
                          displayAmount = displayAmount * months;
                          monthText = ` (x ${months} months)`;
                        }

                        return (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-blue-100 pb-2">
                            <span className="text-slate-600 font-medium">
                              {fee.fee_name}
                              <span className="ml-2 text-[10px] bg-white px-1 rounded border capitalize text-blue-500">
                                {fee.frequency}{monthText}
                              </span>
                            </span>
                            <span className="font-bold text-slate-800">
                              ₹{displayAmount.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between pt-2 text-blue-800 font-black">
                        <span>Total Fee</span>
                        <span>₹{fees.academicBase.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: TRANSPORT */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                <div className="flex items-center gap-3 mb-8 text-xl font-bold"><Bus className="text-blue-600" /> Transport Services</div>
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Route</label>
                    <select
                      name="transportRoute"
                      value={formData.transportRoute}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none bg-gray-50 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="0">No Transport</option>
                      <option value="1000">Test Route - ₹1,000</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex items-center gap-3 text-xl font-bold"><Receipt className="text-blue-600" /> Final Summary Preview</div>
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <p><span className="text-slate-400 font-bold uppercase text-[10px]">Student:</span><br />{formData.studentName}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[10px]">Class:</span><br />{classes.find(c => c.value == formData.studentClass)?.label || 'N/A'}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex justify-between"><span>Base Academic Fees</span><span className="font-bold">₹{fees.academicBase.toLocaleString()}</span></div>
                    {fees.discount > 0 && <div className="flex justify-between text-emerald-600 italic"><span>({formData.parentType}) Discount</span><span>- ₹{fees.discount.toLocaleString()}</span></div>}
                    <div className="flex justify-between"><span>Transport Fee</span><span className="font-bold">₹{fees.transport.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xl font-black text-blue-600 pt-4 border-t border-dashed">
                      <span>Net Total</span>
                      <span>₹{fees.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: FINAL VERIFICATION */}
            {currentStep === 5 && (
              <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <AlertCircle size={40} />
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-black text-slate-800">Are you sure?</h2>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Please check all the details for <b>{formData.studentName}</b> before finalizing. Once confirmed, the student will be enrolled and a fee ledger will be created.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-0 bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer ${currentStep === 5 ? 'bg-emerald-500' : 'bg-[#faae1c]'}`}
              >
                {isSubmitting ? "Submitting..." : currentStep === 5 ? "Confirm & Submit" : "Continue"}
                {!isSubmitting && currentStep < 5 && <ChevronRight size={20} />}
                {!isSubmitting && currentStep === 5 && <CheckCircle size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdmissionForm;