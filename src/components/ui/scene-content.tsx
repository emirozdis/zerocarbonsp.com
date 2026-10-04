import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./scene-content.module.css";

/** A shared, solid boundary between an illustrated scene and its page content. */
export function SceneContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn(styles.surface, className)} {...props} />;
}
