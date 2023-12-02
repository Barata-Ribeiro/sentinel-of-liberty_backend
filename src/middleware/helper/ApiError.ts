export class ApiError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(message, 403);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class MethodNotAllowedError extends ApiError {
    constructor(message: string) {
        super(message, 405);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class UnsupportedMediaTypeError extends ApiError {
    constructor(message: string) {
        super(message, 415);
    }
}

export class InternalServerError extends ApiError {
    constructor(message: string) {
        super(message, 500);
    }
}

export class NotImplemented extends ApiError {
    constructor(message: string) {
        super(message, 501);
    }
}

export class BadGatewayError extends ApiError {
    constructor(message: string) {
        super(message, 502);
    }
}

export class ServiceUnavailableError extends ApiError {
    constructor(message: string) {
        super(message, 503);
    }
}

export class GatewayTimeoutError extends ApiError {
    constructor(message: string) {
        super(message, 504);
    }
}
