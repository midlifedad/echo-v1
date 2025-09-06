'use client';

import PageHeader from '@/components/layout/PageHeader';
import TileGrid from '@/components/tiles/TileGrid';
import { useTiles } from '@/contexts/TileContext';

export default function EditorPage() {
  const { addTile } = useTiles();

  return (
    <div>
      <PageHeader 
        title="Editor"
        subtitle="Design and customize your dashboard tiles"
        onAddTile={addTile}
      />
      <TileGrid />
    </div>
  );
}