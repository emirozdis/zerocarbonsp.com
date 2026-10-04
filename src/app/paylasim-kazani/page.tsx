import type { Metadata } from "next";
import { KazanDashboard } from "@/components/kazan/dashboard";

export const metadata: Metadata = {
  title: "Paylaşım Kazanı | Tabaktan Ormana",
  description:
    "Bir okul, bir kazan, ortak bir iyilik. Gıda tasarrufumuzla kazanımızı dolduruyor, birlikte fidan dikme hedefine ilerliyoruz.",
};

export default function PaylasimKazani() {
  return <KazanDashboard />;
}
