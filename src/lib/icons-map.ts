import {
  IconAccessPoint,
  IconBriefcase,
  IconDeviceComputerCamera,
  IconDeviceDesktop,
  IconDeviceGamepad,
  IconDeviceLaptop,
  IconDeviceSdCard,
  IconDeviceSpeaker,
  IconHeadphones,
  IconKeyboard,
  IconMicrophone,
  IconMouse,
  IconPlug,
  IconRecharging,
  IconUsb,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { CategoryIconEnum } from "./schemas/category";

export const iconsMap = new Map<
  CategoryIconEnum,
  ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>
>([
  ["KEYBOARDS", IconKeyboard],
  ["MICE", IconMouse],
  ["MONITORS", IconDeviceDesktop],
  ["SPEAKERS", IconDeviceSpeaker],
  ["HEADSETS", IconHeadphones],
  ["CONTROLLERS", IconDeviceGamepad],
  ["WIRED", IconPlug],
  ["WIRELESS", IconAccessPoint],
  ["MICROPHONES", IconMicrophone],
  ["STORAGE", IconDeviceSdCard],
  ["LAPTOPS", IconDeviceLaptop],
  ["CHARGERS", IconRecharging],
  ["BAGS", IconBriefcase],
  ["CABLES", IconUsb],
  ["WEBCAMS", IconDeviceComputerCamera],
]);
