import "./GradientText.css";

const GradientText = ({
  children,
  colors = ["#0b00d6ff", "#bc7a00ff", "#a90000ff"],
  animationSpeed = 5,
  className = ""
}) => {
  const style = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`
  };

  return (
    <span className={`gradient-text ${className}`} style={style}>
      {children}
    </span>
  );
};

export default GradientText;
