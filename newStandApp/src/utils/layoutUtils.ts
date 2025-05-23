import type { LayoutItem } from '../types/layoutTypes';

/**
 * Expands the last component in each row to fill empty horizontal space to its right.
 * Only expands if no other component is placed to the right in the same row.
 * Respects maxW if set on the component.
 * Returns a new layout array (does not mutate input).
 */
export function expandComponentsToFillRow(layout: LayoutItem[], gridCols = 12): LayoutItem[] {
  // Group items by row (y)
  const rows: Record<number, LayoutItem[]> = {};
  layout.forEach(item => {
    if (!rows[item.y]) rows[item.y] = [];
    rows[item.y].push(item);
  });

  const newLayout = layout.map(item => ({ ...item }));

  Object.entries(rows).forEach(([y, items]) => {
    // Sort by x (left to right)
    const sorted = [...items].sort((a, b) => a.x - b.x);
    const last = sorted[sorted.length - 1];
    const rightEdge = last.x + last.w;
    if (rightEdge < gridCols) {
      // Find maxW if set, otherwise allow full expansion
      const maxW = last.maxW ?? gridCols;
      const newWidth = Math.min(last.w + (gridCols - rightEdge), maxW);
      // Update the last item's width in the newLayout
      const idx = newLayout.findIndex(i => i.i === last.i);
      newLayout[idx] = { ...last, w: newWidth };
    }
  });

  return newLayout;
}
