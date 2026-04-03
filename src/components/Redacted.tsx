type Props = {
  text: string;
};

export default function Redacted({ text }: Props) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        color: "#c8d4ff",
        letterSpacing: "0.02em"
      }}
    >
      {text}
      <span
        style={{
          position: "absolute",
          left: "28%",
          right: "10%",
          top: "50%",
          height: "58%",
          background: "linear-gradient(90deg, rgba(0,0,0,0.95), rgba(20,20,20,0.98))",
          transform: "translateY(-50%)",
          borderRadius: "4px",
          opacity: 0.88,
          pointerEvents: "none"
        }}
      />
    </span>
  );
}
