export default function AvatarLetter({ text = "User", size = 40, rounded = "full", className = "", bgColor = "#FAAE1C", onClick=undefined
}) {
  const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className={`
        flex items-center justify-center
        font-black text-white
        shadow-sm border border-gray-200
        ${rounded === "3xl" ? "rounded-3xl" : "rounded-full"}
        ${className}
      `}
      style={{
        width: size,
        minWidth: size,
        minHeight: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.5,
        fontWeight:400
      }}
      onClick={onClick}
    >
      {letter}
    </div>
  );
}
