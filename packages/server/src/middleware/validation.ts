import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const zodError = error as ZodError;
      res.status(400).json({
        error: 'Validation failed',
        details: zodError.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      const zodError = error as ZodError;
      res.status(400).json({
        error: 'Invalid query parameters',
        details: zodError.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
}
