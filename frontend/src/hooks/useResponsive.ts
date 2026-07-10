import { Grid } from "antd";

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();

  return {
    isMobile: !screens.md,
    isTablet: Boolean(screens.md && !screens.lg),
    isDesktop: Boolean(screens.lg),
    screens,
  };
};
