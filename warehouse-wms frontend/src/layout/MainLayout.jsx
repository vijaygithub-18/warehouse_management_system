import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Outlet } from "react-router-dom";
import styles from "../styles/layout/MainLayout.module.css";

function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Navbar />
        <main className={styles.main}>
          <Outlet />
          <Breadcrumb />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
