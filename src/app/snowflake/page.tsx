"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SnowflakeConnectionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hostAccount: '',
    givenUsername: '',
    givenPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setTestSuccess(false);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError('');
    setTestSuccess(false);
    setTestResult(null);

    try {
      const response = await fetch('/api/snowflake/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hostAccount: formData.hostAccount,
          givenUsername: formData.givenUsername,
          givenPassword: formData.givenPassword,
          testOnly: true
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Connection test failed');
      }

      setTestSuccess(true);
      setTestResult(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/snowflake/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to connect Snowflake');
      }

      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '520px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #29b6f6 0%, #1976d2 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(41, 182, 246, 0.3)'
          }}>❄️</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.5px' }}>Connect Snowflake</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Enter your Snowflake credentials to start monitoring</p>
        </div>

        <div>
          {error && (
            <div style={{
              padding: '12px 14px',
              marginBottom: '20px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #fee2e2'
            }}>{error}</div>
          )}

          {testSuccess && testResult && (
            <div style={{
              padding: '12px 14px',
              marginBottom: '20px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #bbf7d0',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              <strong>{testResult.message}</strong>
              {testResult.connectionId && <div style={{ marginTop: '6px' }}>Connection ID: {testResult.connectionId}</div>}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Account Identifier</label>
            <input
              type="text"
              name="hostAccount"
              value={formData.hostAccount}
              onChange={handleChange}
              placeholder="abc12345.us-east-1"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'border-color 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>Format: orgname-accountname or account.region</small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Username</label>
            <input
              type="text"
              name="givenUsername"
              value={formData.givenUsername}
              onChange={handleChange}
              placeholder="monitoring_server"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'border-color 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Password</label>
            <input
              type="password"
              name="givenPassword"
              value={formData.givenPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'border-color 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing || !formData.hostAccount || !formData.givenUsername || !formData.givenPassword}
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '12px',
              backgroundColor: testing ? '#cbd5e1' : '#ffffff',
              color: testing ? '#64748b' : '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (testing || !formData.hostAccount || !formData.givenUsername || !formData.givenPassword) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => { if (!testing && formData.hostAccount && formData.givenUsername && formData.givenPassword) (e.target as HTMLElement).style.backgroundColor = '#eff6ff'; }}
            onMouseLeave={(e) => { if (!testing) (e.target as HTMLElement).style.backgroundColor = '#ffffff'; }}
          >
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !testSuccess}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || !testSuccess ? '#cbd5e1' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || !testSuccess) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: (loading || !testSuccess) ? 'none' : '0 1px 3px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => { if (!loading && testSuccess) (e.target as HTMLElement).style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { if (!loading && testSuccess) (e.target as HTMLElement).style.backgroundColor = '#3b82f6'; }}
          >
            {loading ? 'Connecting...' : 'Connect & Start Monitoring'}
          </button>

          {!testSuccess && <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>Please test your connection before proceeding</p>}
        </div>
      </div>
    </div>
  );
}
