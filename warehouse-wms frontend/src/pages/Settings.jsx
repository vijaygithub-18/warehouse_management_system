import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import styles from '../styles/pages/Settings.module.css';

function Settings() {
  const toast = useToast();
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Warehouse WMS',
    notification_emails: '',
    low_stock_threshold: 50,
    send_daily_report: false,
    send_low_stock_alert: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSMTP, setTestingSMTP] = useState(false);
  const [checkingLowStock, setCheckingLowStock] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/settings/email', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmailSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/settings/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailSettings)
      });

      if (res.ok) {
        toast.success('Email settings saved successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testSMTP = async () => {
    if (!emailSettings.smtp_host || !emailSettings.smtp_user) {
      toast.error('Please fill in SMTP host and user');
      return;
    }

    setTestingSMTP(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailSettings)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Test email sent successfully! Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestingSMTP(false);
    }
  };

  const checkLowStock = async () => {
    setCheckingLowStock(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/settings/check-low-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Low stock check completed!');
      } else {
        toast.error(data.error || 'Failed to check low stock');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check low stock');
    } finally {
      setCheckingLowStock(false);
    }
  };

  const handleChange = (field, value) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ Email Notification Settings</h1>
        <p className={styles.subtitle}>Configure email notifications for low stock alerts and reports</p>
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📧 Email Configuration</h2>
          
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={emailSettings.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Enable Email Notifications</span>
            </label>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>SMTP Host *</label>
              <input
                className={styles.input}
                value={emailSettings.smtp_host}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
                disabled={!emailSettings.enabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SMTP Port *</label>
              <input
                className={styles.input}
                type="number"
                value={emailSettings.smtp_port}
                onChange={(e) => handleChange('smtp_port', e.target.value)}
                placeholder="587"
                disabled={!emailSettings.enabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SMTP Username *</label>
              <input
                className={styles.input}
                value={emailSettings.smtp_user}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="your-email@gmail.com"
                disabled={!emailSettings.enabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SMTP Password *</label>
              <input
                className={styles.input}
                type="password"
                value={emailSettings.smtp_password}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
                placeholder="••••••••"
                disabled={!emailSettings.enabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>From Email *</label>
              <input
                className={styles.input}
                value={emailSettings.from_email}
                onChange={(e) => handleChange('from_email', e.target.value)}
                placeholder="noreply@warehouse.com"
                disabled={!emailSettings.enabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>From Name</label>
              <input
                className={styles.input}
                value={emailSettings.from_name}
                onChange={(e) => handleChange('from_name', e.target.value)}
                placeholder="Warehouse WMS"
                disabled={!emailSettings.enabled}
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Notification Recipients (comma-separated)</label>
            <textarea
              className={styles.textarea}
              value={emailSettings.notification_emails}
              onChange={(e) => handleChange('notification_emails', e.target.value)}
              placeholder="admin@company.com, manager@company.com"
              disabled={!emailSettings.enabled}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔔 Notification Preferences</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Low Stock Threshold</label>
            <input
              className={styles.input}
              type="number"
              value={emailSettings.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
              placeholder="50"
              disabled={!emailSettings.enabled}
            />
            <p className={styles.hint}>Send alert when stock falls below this value</p>
          </div>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={emailSettings.send_low_stock_alert}
                onChange={(e) => handleChange('send_low_stock_alert', e.target.checked)}
                className={styles.checkbox}
                disabled={!emailSettings.enabled}
              />
              <span>Send Low Stock Alerts</span>
            </label>
          </div>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={emailSettings.send_daily_report}
                onChange={(e) => handleChange('send_daily_report', e.target.checked)}
                className={styles.checkbox}
                disabled={!emailSettings.enabled}
              />
              <span>Send Daily Inventory Report</span>
            </label>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.testButton}
            onClick={testSMTP}
            disabled={!emailSettings.enabled || testingSMTP}
          >
            {testingSMTP ? '📤 Sending...' : '📤 Send Test Email'}
          </button>
          <button
            className={styles.alertButton}
            onClick={checkLowStock}
            disabled={!emailSettings.enabled || checkingLowStock}
          >
            {checkingLowStock ? '⚠️ Checking...' : '⚠️ Check Low Stock'}
          </button>
          <button
            className={styles.saveButton}
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>ℹ️ Setup Instructions</h3>
        <ul className={styles.infoList}>
          <li>For Gmail: Use App Password instead of regular password</li>
          <li>Enable "Less secure app access" or use OAuth2</li>
          <li>Common SMTP ports: 587 (TLS), 465 (SSL), 25 (Plain)</li>
          <li>Test email configuration before enabling notifications</li>
          <li>Multiple recipients can be added separated by commas</li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;
