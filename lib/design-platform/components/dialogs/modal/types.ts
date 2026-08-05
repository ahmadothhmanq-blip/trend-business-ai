import type { TbdpComponentBaseProps, TbdpComponentSize, TbdpDirection } from "@/lib/design-platform/components/core";

export type ModalProps = TbdpComponentBaseProps & {
  size?: TbdpComponentSize;
  dir?: TbdpDirection;
  children?: import("react").ReactNode;
  title?: string;
  description?: string;
  label?: string;
};
