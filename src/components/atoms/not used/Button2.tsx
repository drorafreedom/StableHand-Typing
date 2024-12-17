// react arrow function export component
// Create a Reusable Button Component

const Button = ({ className, href, onClick, children, px, solid }) => {
  const fancyBackground =
    "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring focus:ring-purple-300 active:bg-blue-700 text-white transform transition duration-500-ease-in-out shadow-md";

  const discreteBackground = "bg-n-black text-color-white";

  const classes = `button h-15  py-4 rounded-full relative inline-flex items-center justify-center transition-colors hover:scale-105 ${
    px || "px-7"
  } ${className || ""} ${
    solid
      ? discreteBackground
      : "bg-n-white text-color-black border-2 border-black"
  }`;

  const classesLink = `button h-15 py-4  rounded-full relative inline-flex items-center justify-center transition-colors hover:underline ${
    px || "px-7"
  } ${className || ""}`;

  const spanClasses = "relative z-10";

  const renderButton = () => (
    <button className={classes} onClick={onClick}>
      <span className={spanClasses}>{children}</span>
    </button>
  );

  const renderLink = () => (
    <a href={href} className={classesLink} onClick={onClick}>
      <span className={spanClasses}>{children}</span>
    </a>
  );

  return href ? renderLink() : renderButton();
};

export default Button;
