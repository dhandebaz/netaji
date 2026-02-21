import type { Metadata } from "next";
import HomeClient from "./home/HomeClient";

export const metadata: Metadata = {
  title: "Neta – Know Your Leader",
  description:
    "Neta is India’s citizen dashboard for MPs and MLAs. Track criminal records, assets, RTI impact, and real-time public sentiment for every representative.",
  alternates: {
    canonical: "https://neta.ink/",
  },
  openGraph: {
    url: "https://neta.ink/",
    title: "Neta – Know Your Leader",
    description:
      "Neta is India’s citizen dashboard for MPs and MLAs. Track criminal records, assets, RTI impact, and real-time public sentiment for every representative.",
    images: [
      {
        url: "https://neta.ink/og-default.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Page() {
  return <HomeClient />;
}
