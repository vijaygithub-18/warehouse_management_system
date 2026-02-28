import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import styles from '../styles/components/BarcodeGenerator.module.css';

function BarcodeGenerator({ value, product, onClose }) {
  const barcodeRef = useRef(null);
  const printRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  }, [value]);

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${product?.name || value}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .barcode-print {
              text-align: center;
              border: 2px solid #000;
              padding: 20px;
              background: white;
            }
            .product-info { margin-bottom: 15px; }
            .product-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .product-sku { font-size: 14px; color: #666; }
            svg { margin: 10px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    const svg = barcodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barcode-${value}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>📊 Barcode Generator</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.barcodeContainer} ref={printRef}>
          <div className="barcode-print">
            {product && (
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-sku">SKU: {product.sku}</div>
              </div>
            )}
            <svg ref={barcodeRef}></svg>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.printButton} onClick={handlePrint}>
            🖨️ Print Barcode
          </button>
          <button className={styles.downloadButton} onClick={handleDownload}>
            💾 Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

export default BarcodeGenerator;
