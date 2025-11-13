import React, { useMemo, useState } from 'react';
import { Organization } from '../../../../types';
import Card from '../../../../components/common/Card';

interface PowerBiReportsProps {
    organizations: Organization[];
}

const PowerBiReports: React.FC<PowerBiReportsProps> = ({ organizations }) => {
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');

    const selectedOrg = useMemo(() => {
        return organizations.find(org => org.id === selectedOrgId);
    }, [organizations, selectedOrgId]);

    return (
        <div className="space-y-4">
            <div className="form-control w-full max-w-xs">
                <label htmlFor="org-select" className="label"><span className="label-text">Select an Organization to View Report</span></label>
                <select 
                    id="org-select"
                    value={selectedOrgId}
                    onChange={e => setSelectedOrgId(e.target.value)}
                    className="select select-bordered"
                >
                    <option value="">-- Select Organization --</option>
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </select>
            </div>
            {selectedOrg?.powerbi_embed_url ? (
                <div className="card bg-base-200 shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 20rem)' }}>
                     <iframe
                        title={selectedOrg.name}
                        width="100%"
                        height="100%"
                        src={selectedOrg.powerbi_embed_url}
                        frameBorder="0"
                        allowFullScreen={true}
                    ></iframe>
                </div>
            ) : selectedOrgId ? (
                 <Card>
                    <div className="text-center p-8">
                        <h2 className="text-xl font-bold">Dashboard Not Available</h2>
                        <p className="opacity-70 mt-2">A Power BI dashboard has not been configured for {selectedOrg?.name}.</p>
                    </div>
                </Card>
            ) : null}
        </div>
    );
};

export default PowerBiReports;