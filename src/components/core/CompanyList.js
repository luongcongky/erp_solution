'use client';

import { useState, useEffect } from 'react';
import { BuildingIcon, PlusIcon } from '@/components/icons';
import Modal from '@/components/Modal';
import { useAuth } from '@/components/AuthProvider';

export default function CompanyList({ selectedCompany, onSelectCompany }) {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, [user]);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/core/companies');
            const data = await res.json();
            if (data.success) {
                let filteredCompanies = data.data;

                // Filter based on user role
                if (user && !user.isSuperAdmin && user.ten_id) {
                    // Regular user: only show company with code matching their ten_id
                    filteredCompanies = data.data.filter(company => company.code === user.ten_id);
                }
                // SuperAdmin: show all companies (no filter)

                setCompanies(filteredCompanies);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/core/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setCompanies([data.data, ...companies]);
                setShowModal(false);
                setFormData({ code: '', name: '', address: '', phone: '', email: '' });
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Failed to create company');
        }
    };

    // Filter companies based on active status
    const filteredCompanies = companies.filter(company => {
        if (filter === 'active') return company.isActive;
        if (filter === 'inactive') return !company.isActive;
        return true; // 'all'
    });

    return (
        <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                <h3 className="card-title">Companies</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.875rem',
                            background: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#E2E8F0',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                        <PlusIcon size={16} />
                        Add Company
                    </button>
                </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
                {loading ? (
                    <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>Loading...</div>
                ) : filteredCompanies.length === 0 ? (
                    <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {filter === 'all' ? 'No companies found' : `No ${filter} companies found`}
                    </div>
                ) : (
                    <div>
                        {filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                onClick={() => onSelectCompany(company)}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    backgroundColor: selectedCompany?.id === company.id ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedCompany?.id !== company.id) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedCompany?.id !== company.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <BuildingIcon size={20} style={{ flexShrink: 0, color: '#94A3B8' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <span style={{ fontWeight: 600 }}>{company.name}</span>
                                            <span className={`badge ${company.isActive ? 'badge-success' : 'badge-error'}`}>
                                                {company.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            Code: {company.code}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Company Modal */}
            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Company">
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Company Code *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                placeholder="e.g., COMP01"
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., ABC Corporation"
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Create Company
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
