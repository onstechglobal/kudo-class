export default function AvatarLetter({
  text = "User",
  size = 40, // px
  rounded = "full", // full | 3xl
  className = "",
  bgColor = "#FAAE1C"
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
        height: size,
        backgroundColor: bgColor, // ✅ STATIC COLOR
        fontSize: size * 0.5,
        fontWeight:400
      }}
    >
      {letter}
    </div>
  );
}
