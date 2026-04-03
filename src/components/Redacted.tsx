type Props = {
  text: string;
};

export default function Redacted({ text }: Props) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        color: "#9caad6",
      }}
    >
      {text}

      <span
        style={{
          position: "absolute",
          left: "30%",
          right: "10%",
          top: "50%",
          height: "60%",
          background: "linear-gradient(90deg, #000, #111)",
          transform: "translateY(-50%)",
          borderRadius: "4px",
          opacity: 0.85,
        }}
      />
    </span>
  );
}
