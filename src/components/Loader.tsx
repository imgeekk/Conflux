const Loader = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const scales = { sm: 0.3, md: 0.5, lg: 0.7, xl: 1 }
  return (
    <div className="loader" style={{ transform: `scale(${scales[size]})` }}>
      <div className="box1" />
      <div className="box2" />
      <div className="box3" />
    </div>
  );
};
export default Loader;