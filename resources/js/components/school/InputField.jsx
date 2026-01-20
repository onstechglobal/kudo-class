
const InputField = ({ label, name, value, onChange, placeholder, icon, type = "text" }) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={`w-full ${icon ? 'pl-12' : 'px-5'} py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all`}
      />
    </div>
  </div>
);

export default InputField;