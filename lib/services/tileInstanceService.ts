import { db } from '@/lib/db';
import { tileInstances, tileTemplates, layoutTiles } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { TileTemplateService } from './tileTemplateService';
import type { 
  TileInstance,
  NewTileInstance,
  CreateTileInstanceRequest,
  UpdateTileInstanceRequest,
  TileInstanceWithRelations,
  TileInstanceWithPositions,
  LayoutTilePosition,
  TileDisplaySettings,
  CopyTileInstanceRequest
} from '@/lib/types/database';

export class TileInstanceService {
  /**
   * Get all instances for a layout
   */
  static async getInstancesForLayout(layoutId: string): Promise<TileInstanceWithPositions[]> {
    try {
      // Get instances
      const instances = await db
        .select()
        .from(tileInstances)
        .where(eq(tileInstances.layoutId, layoutId));
      
      // Get positions for each instance
      const instancesWithPositions = await Promise.all(
        instances.map(async (instance) => {
          const positions = await db
            .select()
            .from(layoutTiles)
            .where(
              and(
                eq(layoutTiles.layoutId, layoutId),
                eq(layoutTiles.tileInstanceId, instance.id)
              )
            );
          
          // Convert to position map
          const positionMap: Record<string, LayoutTilePosition['position']> = {};
          positions.forEach(p => {
            positionMap[p.breakpoint] = p.position;
          });
          
          return {
            ...instance,
            positions: positionMap
          } as TileInstanceWithPositions;
        })
      );
      
      return instancesWithPositions;
    } catch (error) {
      console.error('Failed to get instances for layout:', error);
      throw error;
    }
  }

  /**
   * Get a single instance with relations
   */
  static async getInstance(id: string): Promise<TileInstanceWithRelations | null> {
    try {
      const results = await db
        .select()
        .from(tileInstances)
        .where(eq(tileInstances.id, id))
        .limit(1);
      
      if (!results[0]) return null;
      
      const instance = results[0];
      
      // Get template if exists
      let template = null;
      if (instance.templateId) {
        template = await TileTemplateService.getTemplate(instance.templateId);
      }
      
      // Get positions
      const positions = await db
        .select()
        .from(layoutTiles)
        .where(eq(layoutTiles.tileInstanceId, id));
      
      return {
        ...instance,
        template,
        positions: positions.map(p => ({
          breakpoint: p.breakpoint,
          position: p.position,
          isVisible: p.isVisible ?? true,
          inheritanceMode: p.inheritanceMode || 'inherit'
        }))
      };
    } catch (error) {
      console.error('Failed to get instance:', error);
      throw error;
    }
  }

  /**
   * Create instance from template
   */
  static async createInstanceFromTemplate(
    templateId: string,
    layoutId: string,
    positions?: Record<string, LayoutTilePosition['position']>
  ): Promise<TileInstance> {
    try {
      // Get template
      const template = await TileTemplateService.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Increment template usage
      await TileTemplateService.incrementUsageCount(templateId);
      
      // Create instance
      const id = `instance_${uuidv4()}`;
      const newInstance: NewTileInstance = {
        id,
        templateId,
        layoutId,
        parentInstanceId: null,
        type: template.type,
        title: template.title,
        config: template.config,
        data: template.data,
        content: template.content,
        dataSource: template.dataSource,
        displaySettings: template.defaultDisplaySettings,
        isModified: false,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(tileInstances).values(newInstance);
      
      // Add positions if provided
      if (positions) {
        await this.updatePositions(id, layoutId, positions);
      }
      
      return newInstance as TileInstance;
    } catch (error) {
      console.error('Failed to create instance from template:', error);
      throw error;
    }
  }

  /**
   * Create custom instance (not from template)
   */
  static async createCustomInstance(
    data: CreateTileInstanceRequest
  ): Promise<TileInstance> {
    try {
      const id = `instance_${uuidv4()}`;
      const newInstance: NewTileInstance = {
        id,
        templateId: data.templateId || null,
        layoutId: data.layoutId,
        parentInstanceId: null,
        type: data.type,
        title: data.title,
        config: data.config,
        data: data.data,
        content: data.content,
        dataSource: data.dataSource,
        displaySettings: data.displaySettings || {
          showBorder: true,
          expandable: true,
          showTitle: true,
          titlePosition: 'top'
        },
        isModified: true, // Custom instances are always modified
        lastSyncedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(tileInstances).values(newInstance);
      
      // Add positions if provided
      if (data.positions) {
        await this.updatePositions(id, data.layoutId, data.positions);
      }
      
      return newInstance as TileInstance;
    } catch (error) {
      console.error('Failed to create custom instance:', error);
      throw error;
    }
  }

  /**
   * Update an instance
   */
  static async updateInstance(
    id: string,
    updates: UpdateTileInstanceRequest
  ): Promise<TileInstance | null> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };
      
      // If content is being updated, mark as modified
      if (updates.title || updates.config || updates.data || updates.content) {
        updateData.isModified = true;
      }
      
      await db
        .update(tileInstances)
        .set(updateData)
        .where(eq(tileInstances.id, id));
      
      const results = await db
        .select()
        .from(tileInstances)
        .where(eq(tileInstances.id, id))
        .limit(1);
      
      return results[0] || null;
    } catch (error) {
      console.error('Failed to update instance:', error);
      throw error;
    }
  }

  /**
   * Copy instance to another layout
   */
  static async copyInstance(data: CopyTileInstanceRequest): Promise<TileInstance> {
    try {
      // Get source instance
      const sourceInstance = await this.getInstance(data.sourceInstanceId);
      if (!sourceInstance) {
        throw new Error('Source instance not found');
      }
      
      // Create new instance
      const id = `instance_${uuidv4()}`;
      const newInstance: NewTileInstance = {
        id,
        templateId: sourceInstance.templateId,
        layoutId: data.targetLayoutId,
        parentInstanceId: data.sourceInstanceId,
        type: sourceInstance.type,
        title: sourceInstance.title,
        config: sourceInstance.config,
        data: sourceInstance.data,
        content: sourceInstance.content,
        dataSource: sourceInstance.dataSource,
        displaySettings: sourceInstance.displaySettings,
        isModified: sourceInstance.isModified,
        lastSyncedAt: sourceInstance.lastSyncedAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(tileInstances).values(newInstance);
      
      // Add positions if provided
      if (data.positions) {
        await this.updatePositions(id, data.targetLayoutId, data.positions);
      }
      
      return newInstance as TileInstance;
    } catch (error) {
      console.error('Failed to copy instance:', error);
      throw error;
    }
  }

  /**
   * Delete an instance
   */
  static async deleteInstance(id: string): Promise<boolean> {
    try {
      // Delete positions first (handled by cascade, but being explicit)
      await db
        .delete(layoutTiles)
        .where(eq(layoutTiles.tileInstanceId, id));
      
      // Delete instance
      await db
        .delete(tileInstances)
        .where(eq(tileInstances.id, id));
      
      return true;
    } catch (error) {
      console.error('Failed to delete instance:', error);
      throw error;
    }
  }

  /**
   * Update instance positions in a layout
   */
  static async updatePositions(
    instanceId: string,
    layoutId: string,
    positions: Record<string, LayoutTilePosition['position']>
  ): Promise<void> {
    try {
      // Delete existing positions
      await db
        .delete(layoutTiles)
        .where(
          and(
            eq(layoutTiles.layoutId, layoutId),
            eq(layoutTiles.tileInstanceId, instanceId)
          )
        );
      
      // Insert new positions
      const positionEntries = Object.entries(positions).map(([breakpoint, position]) => ({
        layoutId,
        tileInstanceId: instanceId,
        breakpoint,
        position,
        isVisible: true,
        inheritanceMode: 'custom' as const
      }));
      
      if (positionEntries.length > 0) {
        await db.insert(layoutTiles).values(positionEntries);
      }
    } catch (error) {
      console.error('Failed to update positions:', error);
      throw error;
    }
  }

  /**
   * Update display settings for an instance
   */
  static async updateDisplaySettings(
    id: string,
    displaySettings: TileDisplaySettings
  ): Promise<TileInstance | null> {
    try {
      return this.updateInstance(id, { displaySettings });
    } catch (error) {
      console.error('Failed to update display settings:', error);
      throw error;
    }
  }

  /**
   * Sync instance with template
   */
  static async syncWithTemplate(instanceId: string): Promise<TileInstance | null> {
    try {
      const instance = await this.getInstance(instanceId);
      if (!instance || !instance.templateId) {
        throw new Error('Instance not found or has no template');
      }
      
      const template = await TileTemplateService.getTemplate(instance.templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Update instance with template data
      return this.updateInstance(instanceId, {
        type: template.type,
        title: template.title,
        config: template.config,
        data: template.data,
        content: template.content,
        dataSource: template.dataSource,
        isModified: false
      });
    } catch (error) {
      console.error('Failed to sync with template:', error);
      throw error;
    }
  }

  /**
   * Get all modified instances for a template
   */
  static async getModifiedInstances(templateId: string): Promise<TileInstance[]> {
    try {
      return await db
        .select()
        .from(tileInstances)
        .where(
          and(
            eq(tileInstances.templateId, templateId),
            eq(tileInstances.isModified, true)
          )
        );
    } catch (error) {
      console.error('Failed to get modified instances:', error);
      throw error;
    }
  }
}