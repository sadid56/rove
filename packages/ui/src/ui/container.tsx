import { PropsWithChildren } from "react";
import { cn } from "../utils";

export interface ContainerProps extends PropsWithChildren {
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return <div className={cn("mx-auto h-full w-full px-4 sm:px-6 md:px-8 lg:px-16", className)}>{children}</div>;
};

export default Container;
