import StepSimulator from "@/components/StepSimulator";

export const metadata = {
  title: "Step Mail Simulator | M.O.C.H.I. LABO",
  description: "ステップメール配信システムのテスト・管理ダッシュボード",
};

export default function SimulatorPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", paddingTop: "50px" }}>
      <StepSimulator />
    </div>
  );
}
