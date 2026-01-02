import { NextResponse } from 'next/server';

/**
 * Categorizes errors for better handling and logging
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  SERVER = 'SERVER_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Maps error categories to HTTP status codes
 */
const statusCodeMap: Record<ErrorCategory, number> = {
  [ErrorCategory.VALIDATION]: 400,
  [ErrorCategory.AUTHENTICATION]: 401,
  [ErrorCategory.AUTHORIZATION]: 403,
  [ErrorCategory.NOT_FOUND]: 404,
  [ErrorCategory.CONFLICT]: 409,
  [ErrorCategory.SERVER]: 500,
  [ErrorCategory.EXTERNAL_SERVICE]: 502,
  [ErrorCategory.RATE_LIMIT]: 429,
  [ErrorCategory.UNKNOWN]: 500,
};

/**
 * Standard API error response structure
 */
interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    category: ErrorCategory;
    code?: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Determines error category from error object
 */
function categorizeError(error: any): ErrorCategory {
  if (error?.name === 'ValidationError') {
    return ErrorCategory.VALIDATION;
  }
  if (error?.code === 'PERMISSION_DENIED') {
    return ErrorCategory.AUTHORIZATION;
  }
  if (error?.code === 'NOT_FOUND') {
    return ErrorCategory.NOT_FOUND;
  }
  if (error?.code === 'ALREADY_EXISTS') {
    return ErrorCategory.CONFLICT;
  }
  if (error?.code === 'UNAUTHENTICATED') {
    return ErrorCategory.AUTHENTICATION;
  }
  if (error?.code === 'RESOURCE_EXHAUSTED') {
    return ErrorCategory.RATE_LIMIT;
  }
  if (error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT')) {
    return ErrorCategory.EXTERNAL_SERVICE;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(
  error: any,
  category?: ErrorCategory,
  code?: string,
  details?: Record<string, any>
): [ApiErrorResponse, number] {
  const resolvedCategory = category || categorizeError(error);
  const statusCode = statusCodeMap[resolvedCategory];
  const errorMessage = error?.message || 'An unexpected error occurred';

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: errorMessage,
      category: resolvedCategory,
      ...(code && { code }),
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return [response, statusCode];
}

/**
 * Wraps an async API route handler with error handling
 */
export function withErrorHandling(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('[API Error]', {
        method: request.method,
        url: request.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const [response, statusCode] = createErrorResponse(error);
      return NextResponse.json(response, { status: statusCode });
    }
  };
}

/**
 * Validates required query parameters
 */
export function validateQueryParams(
  searchParams: URLSearchParams,
  required: string[]
): { valid: boolean; missing?: string[] } {
  const missing = required.filter(param => !searchParams.get(param));

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Safely parses JSON from request
 */
export async function parseRequestBody(request: Request) {
  try {
    const body = await request.json();
    return { success: true, data: body };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : undefined,
      },
    };
  }
}

/**
 * Validates required fields in request body
 */
export function validateRequestBody(
  body: any,
  required: string[]
): { valid: boolean; missing?: string[] } {
  const missing = required.filter(field => body[field] === undefined || body[field] === null);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Creates a standardized success response
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
