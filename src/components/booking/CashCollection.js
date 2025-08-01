import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaRupeeSign, FaMoneyBillWave } from 'react-icons/fa';
import styles from './CashCollection.module.css';

export default function CashCollection() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const API_URL = `${process.env.REACT_APP_API_URL}/api`;

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/booking/cash-collection/summary`);
      const data = await res.json();
      if (data.success) setSummary(data);
      else setError(data.message || 'Failed to fetch');
    } catch (err) {
      setError('Error fetching data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  const handleReceived = async (id) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const res = await fetch(`${API_URL}/booking/cash-collection/${id}/received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) fetchSummary();
      else alert(data.message || 'Failed to update');
    } catch (err) {
      alert('Error updating booking');
    }
    setUpdating((u) => ({ ...u, [id]: false }));
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <FaMoneyBillWave size={32} />
        Cash Collection Summary
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryTotal}>
          <FaRupeeSign style={{color:'#007bff',marginRight:4}}/>
          <strong>Total:</strong> ₹{summary.totalAmount.toFixed(2)}
        </div>
        <div className={styles.summaryVendor}>
          Vendor (80%): ₹{summary.vendorShare.toFixed(2)}
        </div>
        <div className={styles.summaryAdmin}>
          Admin (20%): ₹{summary.adminShare.toFixed(2)}
        </div>
      </div>
      <hr className={styles.divider}/>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Booking ID</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Cash Status</th>
            <th className={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {summary.bookings.map((b, i) => (
            <tr key={b.id} className={styles.tr}>
              <td className={styles.td}>{b.id}</td>
              <td className={styles.td}>{b.booking_date}</td>
              <td className={styles.td}>₹{parseFloat(b.amount).toFixed(2)}</td>
              <td className={styles.td}>
                {b.is_cash_collected
                  ? <span className={`${styles.badge} ${styles.badgeReceived}`}><FaCheckCircle style={{marginRight:4}}/>Received by {b.cash_collected_by}<br/><span style={{fontWeight:400,fontSize:12}}>{new Date(b.cash_collected_at).toLocaleString()}</span></span>
                  : <span className={`${styles.badge} ${styles.badgePending}`}><FaClock style={{marginRight:4}}/>Pending</span>}
              </td>
              <td className={styles.td}>
                {!b.is_cash_collected && (
                  <button className={styles.button} onClick={()=>handleReceived(b.id)} disabled={updating[b.id]}>
                    {updating[b.id] ? 'Updating...' : 'Received'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 