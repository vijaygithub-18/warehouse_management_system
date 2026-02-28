import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { useToast } from './ToastContext';
import styles from '../styles/components/ExportButtons.module.css';

function ExportButtons({ data, filename, title }) {
  const toast = useToast();

  const handleExport = (type) => {
    let result;
    
    switch(type) {
      case 'excel':
        result = exportToExcel(data, filename);
        break;
      case 'csv':
        result = exportToCSV(data, filename);
        break;
      case 'pdf':
        result = exportToPDF(data, filename, title);
        break;
      default:
        return;
    }

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={styles.exportButtons}>
      <button 
        className={`${styles.exportBtn} ${styles.excel}`}
        onClick={() => handleExport('excel')}
        title="Export to Excel"
      >
        📊 Excel
      </button>
      <button 
        className={`${styles.exportBtn} ${styles.csv}`}
        onClick={() => handleExport('csv')}
        title="Export to CSV"
      >
        📄 CSV
      </button>
      <button 
        className={`${styles.exportBtn} ${styles.pdf}`}
        onClick={() => handleExport('pdf')}
        title="Export to PDF"
      >
        📕 PDF
      </button>
    </div>
  );
}

export default ExportButtons;
