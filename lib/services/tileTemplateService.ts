import { db } from '@/lib/db';
import { tileTemplates, userTemplateFavorites, tileInstances } from '@/lib/db/schema';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { 
  TileTemplate, 
  NewTileTemplate,
  CreateTileTemplateRequest,
  UpdateTileTemplateRequest,
  TileTemplateWithMetadata,
  TileDisplaySettings 
} from '@/lib/types/database';

export class TileTemplateService {
  /**
   * Get all templates with optional filtering
   */
  static async getTemplates(options?: {
    category?: string;
    isPublic?: boolean;
    ownerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<TileTemplateWithMetadata[]> {
    try {
      let query = db.select().from(tileTemplates);
      
      // Apply filters
      const conditions = [];
      if (options?.category) {
        conditions.push(eq(tileTemplates.category, options.category));
      }
      if (options?.isPublic !== undefined) {
        conditions.push(eq(tileTemplates.isPublic, options.isPublic));
      }
      if (options?.ownerId) {
        conditions.push(eq(tileTemplates.ownerId, options.ownerId));
      }
      if (options?.search) {
        conditions.push(
          or(
            like(tileTemplates.title, `%${options.search}%`),
            like(tileTemplates.name, `%${options.search}%`),
            like(tileTemplates.description, `%${options.search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting and pagination
      query = query.orderBy(desc(tileTemplates.createdAt));
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.offset(options.offset);
      }
      
      const templates = await query;
      
      // Add metadata (could be enhanced with favorites and instance counts)
      return templates.map(t => ({
        ...t,
        isFavorite: false, // TODO: Check user favorites
        instanceCount: 0, // TODO: Count instances
        lastUsedAt: null
      }));
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw error;
    }
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(id: string): Promise<TileTemplate | null> {
    try {
      const results = await db
        .select()
        .from(tileTemplates)
        .where(eq(tileTemplates.id, id))
        .limit(1);
      
      return results[0] || null;
    } catch (error) {
      console.error('Failed to get template:', error);
      throw error;
    }
  }

  /**
   * Create a new template
   */
  static async createTemplate(data: CreateTileTemplateRequest): Promise<TileTemplate> {
    try {
      const id = `template_${uuidv4()}`;
      
      const newTemplate: NewTileTemplate = {
        id,
        type: data.type,
        title: data.title,
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        isSystem: false,
        thumbnail: data.thumbnail,
        ownerId: 'user-1', // TODO: Get from auth context
        isPublic: data.isPublic || false,
        usageCount: 0,
        config: data.config,
        data: data.data,
        content: data.content,
        dataSource: data.dataSource,
        defaultDisplaySettings: data.defaultDisplaySettings || {
          showBorder: true,
          expandable: true,
          showTitle: true,
          titlePosition: 'top'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(tileTemplates).values(newTemplate);
      
      return newTemplate as TileTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(
    id: string, 
    updates: UpdateTileTemplateRequest
  ): Promise<TileTemplate | null> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db
        .update(tileTemplates)
        .set(updateData)
        .where(eq(tileTemplates.id, id));
      
      return this.getTemplate(id);
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(tileTemplates)
        .where(eq(tileTemplates.id, id));
      
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Create a template from an existing instance
   */
  static async createTemplateFromInstance(
    instanceId: string,
    data: {
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<TileTemplate | null> {
    try {
      // Get the instance
      const instances = await db
        .select()
        .from(tileInstances)
        .where(eq(tileInstances.id, instanceId))
        .limit(1);
      
      const instance = instances[0];
      if (!instance) {
        throw new Error('Instance not found');
      }
      
      // Create template from instance
      const templateData: CreateTileTemplateRequest = {
        type: instance.type,
        title: instance.title,
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        config: instance.config,
        data: instance.data,
        content: instance.content,
        dataSource: instance.dataSource,
        defaultDisplaySettings: instance.displaySettings,
        isPublic: data.isPublic
      };
      
      return this.createTemplate(templateData);
    } catch (error) {
      console.error('Failed to create template from instance:', error);
      throw error;
    }
  }

  /**
   * Increment usage count for a template
   */
  static async incrementUsageCount(id: string): Promise<void> {
    try {
      await db
        .update(tileTemplates)
        .set({
          usageCount: sql`${tileTemplates.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(tileTemplates.id, id));
    } catch (error) {
      console.error('Failed to increment usage count:', error);
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  static async getPopularTemplates(limit: number = 10): Promise<TileTemplate[]> {
    try {
      return await db
        .select()
        .from(tileTemplates)
        .where(eq(tileTemplates.isPublic, true))
        .orderBy(desc(tileTemplates.usageCount))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get popular templates:', error);
      throw error;
    }
  }

  /**
   * Get recent templates
   */
  static async getRecentTemplates(limit: number = 10): Promise<TileTemplate[]> {
    try {
      return await db
        .select()
        .from(tileTemplates)
        .orderBy(desc(tileTemplates.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get recent templates:', error);
      throw error;
    }
  }

  /**
   * Get system templates
   */
  static async getSystemTemplates(): Promise<TileTemplate[]> {
    try {
      return await db
        .select()
        .from(tileTemplates)
        .where(eq(tileTemplates.isSystem, true))
        .orderBy(tileTemplates.title);
    } catch (error) {
      console.error('Failed to get system templates:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a template
   */
  static async toggleFavorite(templateId: string, userId: string): Promise<boolean> {
    try {
      // Check if already favorited
      const existing = await db
        .select()
        .from(userTemplateFavorites)
        .where(
          and(
            eq(userTemplateFavorites.templateId, templateId),
            eq(userTemplateFavorites.userId, userId)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Remove favorite
        await db
          .delete(userTemplateFavorites)
          .where(
            and(
              eq(userTemplateFavorites.templateId, templateId),
              eq(userTemplateFavorites.userId, userId)
            )
          );
        return false;
      } else {
        // Add favorite
        await db.insert(userTemplateFavorites).values({
          templateId,
          userId,
          createdAt: new Date()
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite templates
   */
  static async getUserFavorites(userId: string): Promise<TileTemplate[]> {
    try {
      const results = await db
        .select({
          template: tileTemplates
        })
        .from(userTemplateFavorites)
        .innerJoin(
          tileTemplates, 
          eq(userTemplateFavorites.templateId, tileTemplates.id)
        )
        .where(eq(userTemplateFavorites.userId, userId))
        .orderBy(desc(userTemplateFavorites.createdAt));
      
      return results.map(r => r.template);
    } catch (error) {
      console.error('Failed to get user favorites:', error);
      throw error;
    }
  }
}