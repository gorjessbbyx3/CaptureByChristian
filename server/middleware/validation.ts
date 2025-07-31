import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateParams = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid parameters', 
        details: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
};

export const validateBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid request body', 
        details: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
};

export const validateQuery = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
};

// Common validation schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number)
});

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
}).refine(data => data.page >= 1, { message: 'Page must be >= 1' })
  .refine(data => data.limit >= 1 && data.limit <= 100, { message: 'Limit must be between 1 and 100' });