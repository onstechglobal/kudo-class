const SelectField = ({ label, name, value, onChange, options, icon }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-12' : 'px-5'} py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 focus:bg-white focus:border-blue-500 outline-none appearance-none cursor-pointer`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>

);

export default SelectField;