'use client';

import LayoutEditorPage from '@/app/layout-editor/page';
import '@/styles/themes/amber-theme.css';

// Simple amber theme preview wrapper around the existing layout editor
export default function StyledLayoutEditorPage() {
  return (
    <div className="amber-theme">
      <div className="amber-banner px-6 py-4 border-b">
        <h2 className="text-lg font-bold">🎨 STYLED PREVIEW</h2>
        <p className="text-sm opacity-70">Amber Theme · Iterative Design Workspace</p>
      </div>
      <LayoutEditorPage />
    </div>
  );
}
