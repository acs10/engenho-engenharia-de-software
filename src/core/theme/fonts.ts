import { DM_Sans, Libre_Franklin } from "next/font/google";

// Mesmas fontes do design (Figma Make), servidas pelo próprio site.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const franklin = Libre_Franklin({ subsets: ["latin"], weight: ["600"], style: ["italic"], variable: "--font-franklin" });

export const fontVariables = `${dmSans.variable} ${franklin.variable}`;
