import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "destructive" | "outline";
  size?: "default" | "icon" | "lg";
}

const variantClasses = {
  default: "bg-primary text-white hover:bg-primary/90",
  ghost: "bg-transparent text-foreground hover:bg-primary/10",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
};

const sizeClasses = {
  default: "px-4 py-2 text-sm",
  icon: "p-2 w-10 h-10",
  lg: "h-12 px-8",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={
          `inline-flex items-center justify-center rounded-md font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
        }
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button }; 