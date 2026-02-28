import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/components/Breadcrumb.module.css';

const routeNames = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/inventory': 'Inventory',
  '/inward': 'Inward',
  '/outward': 'Outward',
  '/sales-orders': 'Sales Orders',
  '/purchase-orders': 'Purchase Orders',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/racks': 'Racks',
  '/users': 'Users',
  '/activity': 'Activity Logs',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/adjustments': 'Stock Adjustments'
};

function Breadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  const currentPage = routeNames[location.pathname] || 'Page';

  return (
    <div className={styles.breadcrumb}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Back
      </button>
      <span className={styles.currentPage}>{currentPage}</span>
    </div>
  );
}

export default Breadcrumb;
