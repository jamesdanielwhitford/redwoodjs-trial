import Joi from 'joi';

// User registration validation schema
const registrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .required()
    .messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title must not exceed 255 characters',
      'any.required': 'Task title is required'
    }),
  
  description: Joi.string()
    .max(2000)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Task description must not exceed 2000 characters'
    }),
  
  status: Joi.string()
    .valid('todo', 'in_progress', 'done')
    .default('todo')
    .messages({
      'any.only': 'Status must be one of: todo, in_progress, done'
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position cannot be negative'
    })
});

// Task update validation schema (allows partial updates)
const taskUpdateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title must not exceed 255 characters'
    }),
  
  description: Joi.string()
    .max(2000)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Task description must not exceed 2000 characters'
    }),
  
  status: Joi.string()
    .valid('todo', 'in_progress', 'done')
    .messages({
      'any.only': 'Status must be one of: todo, in_progress, done'
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position cannot be negative'
    })
}).min(1); // At least one field must be provided

// Task reorder validation schema
const taskReorderSchema = Joi.object({
  tasks: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        position: Joi.number().integer().min(0).required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one task must be provided',
      'any.required': 'Tasks array is required'
    })
});

// Query parameters validation
const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  status: Joi.string()
    .valid('todo', 'in_progress', 'done')
    .messages({
      'any.only': 'Status filter must be one of: todo, in_progress, done'
    }),
  
  userId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive'
    })
});

// ID parameter validation
const idSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be positive',
      'any.required': 'ID is required'
    })
});

// Validation functions
export function validateRegistration(data) {
  return registrationSchema.validate(data, { abortEarly: false });
}

export function validateLogin(data) {
  return loginSchema.validate(data, { abortEarly: false });
}

export function validateTask(data) {
  return taskSchema.validate(data, { abortEarly: false });
}

export function validateTaskUpdate(data) {
  return taskUpdateSchema.validate(data, { abortEarly: false });
}

export function validateTaskReorder(data) {
  return taskReorderSchema.validate(data, { abortEarly: false });
}

export function validateQuery(data) {
  return querySchema.validate(data, { abortEarly: false });
}

export function validateId(data) {
  return idSchema.validate(data, { abortEarly: false });
}

// Generic validation middleware factory
export function validateMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : 
                 source === 'params' ? req.params :
                 source === 'query' ? req.query : req.body;
    
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
          value: d.context?.value
        }))
      });
    }
    
    // Replace the original data with validated/sanitized data
    if (source === 'body') req.body = value;
    else if (source === 'params') req.params = value;
    else if (source === 'query') req.query = value;
    
    next();
  };
}