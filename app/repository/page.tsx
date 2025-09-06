'use client';

import PageHeader from '@/components/layout/PageHeader';

export default function RepositoryPage() {
  return (
    <div>
      <PageHeader 
        title="Repository"
        subtitle="Data sources and asset management"
      />
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-border-color/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗃️</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Repository Coming Soon</h3>
          <p className="text-text-secondary">Centralized data and asset management</p>
        </div>
      </div>
    </div>
  );
}