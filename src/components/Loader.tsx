const Loader = ({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" | "xl" }) => {
  const scales = { xs: 0.1, sm: 0.3, md: 0.5, lg: 0.7, xl: 1 }
  const s = scales[size]
  return (
    <div style={{ width: `${112 * s}px`, height: `${112 * s}px`, overflow: "hidden" }}>
      <div
        className="loader"
        style={{ transform: `scale(${s})`, transformOrigin: "top left" }}
      >
        <div className="box1" />
        <div className="box2" />
        <div className="box3" />
      </div>
    </div>
  );
};

export default Loader;