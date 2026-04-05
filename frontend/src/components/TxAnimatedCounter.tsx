import { useEffect, useRef, useState } from "react";
import { Typography, type TypographyProps } from "@mui/material";

interface TxAnimatedCounterProps extends Omit<TypographyProps, "children"> {
  value: number;
  duration?: number;
}

export default function TxAnimatedCounter({
  value,
  duration = 1200,
  ...props
}: TxAnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <Typography {...props}>{display}</Typography>;
}
