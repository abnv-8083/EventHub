class AppError extends Error {
    constructor(message, statusCode) {
        // Call the parent built-in Error class constructor with the message
        super(message);

        this.statusCode = statusCode;
        // If the status code is a 4xx (e.g., 400, 404), it's a 'fail', otherwise it's a 500 'error'
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Flag to identify errors we create (operational) vs unexpected programming bugs
        this.isOperational = true;

        // Captures the stack trace, excluding this constructor call from the stack
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;