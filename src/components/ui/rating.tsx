import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  showValue?: boolean
}

export function Rating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
  className,
  showValue = false,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null)
    }
  }

  const displayValue = hoverValue ?? value

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-200",
                rating <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className={cn("font-medium text-muted-foreground ml-2", textSizeClasses[size])}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface RatingDisplayProps {
  value: number
  totalRatings?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingDisplay({
  value,
  totalRatings,
  size = "md",
  className
}: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Rating value={value} readonly size={size} />
      <span className={cn("font-medium text-muted-foreground", {
        "text-sm": size === "sm",
        "text-base": size === "md", 
        "text-lg": size === "lg"
      })}>
        {value.toFixed(1)}
        {totalRatings && (
          <span className="text-muted-foreground/70 ml-1">
            ({totalRatings})
          </span>
        )}
      </span>
    </div>
  )
}