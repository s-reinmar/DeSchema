/**
 * @file annotation.types.ts
 * @description Strongly-typed contracts for interactive schematic annotations and pan-zoom transforms.
 * @author @s-reinmar
 * @license MIT
 */

/**
 * 2D Pan and Zoom transformation state for the vector schematic canvas.
 */
export interface PanZoomState {
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
}

/**
 * User-created temporary marker or pedagogical annotation placed on a schematic component.
 */
export interface SchematicAnnotation {
  readonly id: string;
  readonly symbolId?: string;
  readonly label: string;
  readonly note: string;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly timestamp: string;
}
