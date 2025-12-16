class ApiResponse {
    constructor (
        statusCode, message = 'request successful', data = null
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode  < 400;
    }
}