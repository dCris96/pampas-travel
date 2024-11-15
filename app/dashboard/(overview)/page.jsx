import DashboardCardsContainer from "@/app/ui/dashboard/dashboardCard/cards-container";
import TablaDashboard from "@/app/ui/dashboard/dashboardTabla/tabla";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <>
      <DashboardCardsContainer />
      <TablaDashboard />
    </>
  );
}
