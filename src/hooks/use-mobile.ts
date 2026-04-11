import { useEffect, useState } from "react";

export function useMobile(maxWidth = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [maxWidth]);

  return isMobile;
}
