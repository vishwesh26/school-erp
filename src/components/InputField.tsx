import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string | number;
  error?: FieldError;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  className,
  placeholder,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : className || "flex flex-col gap-1.5 w-full"}>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#f16122] focus:bg-white focus:ring-2 focus:ring-[#f16122]/20 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold outline-none transition-all duration-200 shadow-2xs placeholder-slate-400"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-rose-500 font-medium">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
