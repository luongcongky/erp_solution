'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import PageTemplate from '@/components/PageTemplate';
import CompanyList from '@/components/core/CompanyList';
import UserList from '@/components/core/UserList';
import './companies.css';

export default function CoreDashboard() {
    const { user, loading } = useAuth();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companies, setCompanies] = useState([]);

    // Fetch companies and auto-select for regular users
    useEffect(() => {
        if (!user) return;

        const fetchCompanies = async () => {
            try {
                const res = await fetch('/api/core/companies');
                const data = await res.json();
                if (data.success) {
                    let filteredCompanies = data.data;

                    // Filter based on user role
                    if (!user.isSuperAdmin && user.ten_id) {
                        // Regular user: only show company with code matching their ten_id
                        filteredCompanies = data.data.filter(company => company.code === user.ten_id);

                        // Auto-select the company for regular users
                        if (filteredCompanies.length > 0) {
                            setSelectedCompany(filteredCompanies[0]);
                        }
                    }

                    setCompanies(filteredCompanies);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();
    }, [user]);

    if (loading || !user) {
        return null; // Let AuthProvider handle redirect
    }

    return (
        <PageTemplate
            breadcrumbs={[
                { label: 'Core' },
                { label: 'Company Management' },
            ]}
        >
            {/* Split Layout */}
            <div className="splitLayout">
                {/* Left Panel - Companies */}
                <div className="leftPanel">
                    <CompanyList
                        selectedCompany={selectedCompany}
                        onSelectCompany={setSelectedCompany}
                    />
                </div>

                {/* Right Panel - Users */}
                <div className="rightPanel">
                    <UserList
                        selectedCompany={selectedCompany}
                    />
                </div>
            </div>
        </PageTemplate>
    );
}
