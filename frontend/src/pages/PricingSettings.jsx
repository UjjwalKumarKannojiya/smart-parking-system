import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const PricingSettings = ({ setError, setSuccess }) => {
  const [policy, setPolicy] = useState({
    basePrice: 20,
    multipliers: {
      compact: 0.8,
      standard: 1.0,
      handicapped: 0.5,
      ev_charging: 1.5
    },
    weekendMultiplier: 1.2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        // We'll add getPricingPolicy to adminAPI
        const response = await adminAPI.getPricingPolicy();
        if (response.policy) {
          setPolicy(response.policy);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load pricing policy');
      }
      setLoading(false);
    };
    fetchPolicy();
  }, [setError]);

  const handleChange = (e, field, subfield = null) => {
    const val = parseFloat(e.target.value);
    if (subfield) {
      setPolicy(prev => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: val }
      }));
    } else {
      setPolicy(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updatePricingPolicy(policy);
      setSuccess('Pricing policy updated successfully!');
    } catch (err) {
      setError('Failed to update pricing policy');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-10"><div className="spin text-blue-500 text-3xl">⏳</div></div>;

  return (
    <div className="slide-in-up space-y-8 fade-in">
      <div>
        <h1 className="page-title">⚙️ Pricing Configuration</h1>
        <p className="page-subtitle">Set global pricing rules and dynamic multipliers</p>
      </div>

      <form onSubmit={handleSubmit} className="card-modern p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-white mb-4">Base Pricing (₹/hr)</h3>
            <label className="block text-sm text-slate-400 mb-2">Base Price</label>
            <input 
              type="number" 
              step="0.1"
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
              value={policy.basePrice}
              onChange={(e) => handleChange(e, 'basePrice')}
            />
          </div>
          
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-white mb-4">Peak / Weekend</h3>
            <label className="block text-sm text-slate-400 mb-2">Weekend Multiplier</label>
            <input 
              type="number" 
              step="0.1"
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
              value={policy.weekendMultiplier}
              onChange={(e) => handleChange(e, 'weekendMultiplier')}
            />
            <p className="text-xs text-slate-500 mt-2">Example: 1.2 = 20% extra on weekends</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-white mb-4">Vehicle Type Multipliers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(policy.multipliers).map(type => (
              <div key={type}>
                <label className="block text-sm text-slate-400 mb-2 capitalize">{type.replace('_', ' ')}</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                  value={policy.multipliers[type]}
                  onChange={(e) => handleChange(e, 'multipliers', type)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Policy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PricingSettings;
