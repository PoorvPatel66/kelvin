import { useEffect, useState } from 'react';
import { BarChart3, Eye, RefreshCw, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAnalytics } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

function MetricList({ title, rows = [] }) {
  const maximum = Math.max(...rows.map((row) => row.count), 1);
  return <section className="admin-ops-metric-list"><h3>{title}</h3>{rows.length ? rows.map((row) => <div className="admin-ops-metric" key={row.label}><div><span>{row.label}</span><strong>{row.count}</strong></div><i style={{ '--metric-width': `${Math.max((row.count / maximum) * 100, 2)}%` }} /></div>) : <p>No data for this period.</p>}</section>;
}

function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  async function load(period = days) {
    try {
      setIsLoading(true);
      setAnalytics(await fetchAnalytics({ days: period }));
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load analytics.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Insights" title="Website Analytics" description="Understand traffic, acquisition sources, devices, pages, and visitor markets." actions={<><select className="admin-ops-period" value={days} onChange={(event) => { const value = Number(event.target.value); setDays(value); load(value); }} aria-label="Analytics period"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option></select><button className="admin-btn" type="button" onClick={() => load()}><RefreshCw size={17} />Refresh</button></>} />
    <section className="admin-ops-stats" aria-busy={isLoading}>
      <article><Eye size={22} /><span>Total visits</span><strong>{Number(analytics.totalVisits || 0).toLocaleString()}</strong></article>
      <article><Users size={22} /><span>Unique visitors</span><strong>{Number(analytics.uniqueVisitors || 0).toLocaleString()}</strong></article>
      <article><BarChart3 size={22} /><span>Days measured</span><strong>{analytics.days || days}</strong></article>
    </section>
    <section className="admin-ops-analytics-grid">
      <MetricList title="Top pages" rows={analytics.topPages} />
      <MetricList title="Traffic sources" rows={analytics.sources} />
      <MetricList title="Devices" rows={analytics.devices} />
      <MetricList title="Countries" rows={analytics.countries} />
    </section>
  </main>;
}

export default AdminAnalyticsPage;
