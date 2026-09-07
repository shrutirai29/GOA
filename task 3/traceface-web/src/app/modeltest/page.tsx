import dynamic from "next/dynamic";

const ModelTest = dynamic(
  () => import("@/components/ModelTest").then((m) => m.ModelTest),
  { ssr: false }
);

export default function ModelTestPage() {
  return <ModelTest />;
}