interface MetricCircleProps {
  value: number;
  label: string;
  type: "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
}

const MetricCircle = ({
  value,
  label,
  type,
  size = "md",
}: MetricCircleProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const typeClasses = {
    success: "border-success bg-secondary text-success",
    danger: "border-destructive bg-red-50 text-destructive",
    warning: "border-warning bg-amber-50 text-warning",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`metric-circle border-4 ${sizeClasses[size]} ${typeClasses[type]}`}
      >
        <span className="text-2xl font-bold">{value}%</span>
      </div>
      <span className={`font-semibold ${typeClasses[type].split(" ").pop()}`}>
        {label}
      </span>
    </div>
  );
};

export default MetricCircle;
