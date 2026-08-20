/*
 @Purpose: All errors response data
*/

interface ErrorResponse {
    header_status: number;
    result_code: number;
    title: string;
    message: string;
}

const errors: { [key: string]: ErrorResponse } = {};

errors['NOT_FOUND'] = {
    header_status: 404,
    result_code: 10,
    title: 'Not Found',
    message: 'The page/data you requested could not be found.'
};

errors['AUTH_FAILURE'] = {
    header_status: 401,
    result_code: 11,
    title: 'Authentication Failed',
    message: "The email/password you provided did not match."
};

errors['ACCESS_DENIED'] = {
    header_status: 403,
    result_code: 12,
    title: 'Access Denied',
    message: "You are not allowed to access the page or resource you are trying to reach."
};

errors['FORBIDDEN'] = {
    header_status: 403,
    result_code: 13,
    title: 'Access Forbidden',
    message: "Accessing the page or resource you are trying to reach is prohibited."
};

errors['DB_ERROR'] = {
    header_status: 500,
    result_code: 14,
    title: 'Database Error',
    message: 'An error occurred in a database operation.'
};

errors['DATA_NOT_FOUND'] = {
    header_status: 404,
    result_code: 15,
    title: 'Data Not Found',
    message: 'The data you requested could not be found.'
};

errors['INTERNAL_SERVER_ERROR'] = {
    header_status: 500,
    result_code: 16,
    title: 'Internal Server Error',
    message: 'Internal server error during your operation.'
};

errors['DUPLICATE_ENTRY'] = {
    header_status: 400,
    result_code: 17,
    title: 'Duplicate Data',
    message: 'The data you provided is already saved. Duplicate data is not allowed.'
};

errors['EMAIL_VERIFYING_FAILURE'] = {
    header_status: 422,
    result_code: 18,
    title: 'Email Verifing Failue',
    message: 'Verification of your provided email failed.'
};

errors['OPP_FAILURE'] = {
    header_status: 400,
    result_code: 19,
    title: 'Operation Failure',
    message: 'The operation failed.'
};

errors['AlREADY_VERIFIED'] = {
    header_status: 400,
    result_code: 20,
    title: 'Already Verified',
    message: 'The information you provided has already been verified.'
};

errors['SOMETHING_WENT_WRONG'] = {
    header_status: 500,
    result_code: 21,
    title: 'Something Went Wrong',
    message: 'Something went wrong in the app server. Please Try again later.'
};

errors['USER_NOT_FOUND'] = {
    header_status: 404,
    result_code: 22,
    title: 'User Not Found',
    message: 'You requested user is not found.'
};

errors['INVALID_OTP'] = {
    header_status: 404,
    result_code: 22,
    title: 'Invalid OTP',
    message: 'The OTP you provided is invalid.'
};

errors['MOBILE_REQUIRED'] = {
    header_status: 400,
    result_code: 22,
    title: 'Mobile Number is required',
    message: 'Please provide a valid mobile number.'
};

errors['UPLOAD_FAILURE'] = {
    header_status: 400,
    result_code: 22,
    title: 'Upload Failure',
    message: 'Your file information is not correct. Please provide a valid file to upload.'
};

errors['INVALID_PASS'] = {
    header_status: 400,
    result_code: 23,
    title: 'Invalid Password',
    message: 'The password you provided is invalid.'
};

errors['TOO_LARGE_REQUEST_ENTITY'] = {
    header_status: 400,
    result_code: 24,
    title: 'Request Entity Too Large',
    message: 'Less than 10MB is allowed for requesting entity.'
};

errors['INVALID_SCHEMA'] = {
    header_status: 500,
    result_code: 25,
    title: 'Invalid Declaration of Schema',
    message: 'Invalid schema file or schema not exported properly.',
};

errors['CONFIRM_PASSWORD_NOT_MATCH'] = {
    header_status: 400,
    result_code: 26,
    title: 'Confirm password not match',
    message: 'The confirmation password you provided does not match the password.'
};

errors['INVALID_CLIENT_TYPE'] = {
    header_status: 400,
    result_code: 27,
    title: 'Invalid Client Type',
    message: 'Please provide valid client_type in query params.'
};

errors['INVALID_CLIENT_VERSION'] = {
    header_status: 400,
    result_code: 28,
    title: 'Invalid Client Version',
    message: 'Please provide valid client_version in query params.'
};

errors['UNSUPPORTED_VERSION'] = {
    header_status: 400,
    result_code: 29,
    title: 'Version not supported',
    message: 'Your provided version is not supported.'
};

errors['ACCESS_UNAUTHORISED'] = {
    header_status: 403,
    result_code: 30,
    title: 'Access Unauthorised',
    message: "You do not have the proper permissions."
};

errors['FEATURE_NOT_AVAILABLE'] = {
    header_status: 403,
    result_code: 31,
    title: 'Feature not availabe',
    message: "This feature is not availabe right now."
};

errors['TIMEOUT'] = {
    header_status: 403,
    result_code: 32,
    title: 'Operation Timeout',
    message: "The operation timeout has expired."
};

errors['WRONG_INPUT_FORMAT'] = {
    header_status: 403,
    result_code: 33,
    title: 'Wrong Input Data Format',
    message: "Please provide valid format of input data."
};

errors['THIRD_PARTY_API_ERROR'] = {
    header_status: 403,
    result_code: 34,
    title: 'Error From Third-Party API server',
    message: "Getting this error from third-party api server."
};

errors['API_AUTH_FAILURE'] = {
    header_status: 403,
    result_code: 35,
    title: 'Access Forbidden',
    message: "Accessing the page or resource you were trying to reach is forbidden."
};

errors['INVALID_REQUEST_DATA'] = {
    header_status: 400,
    result_code: 36,
    title: 'Invalid Request Data',
    message: "You provided data is invalid."
};

errors['INVALID_JSON_BODY'] = {
    header_status: 403,
    result_code: 37,
    title: 'Invalid JSON format',
    message: "Invalid format of json body."
};

errors['UNAUTHORIZED'] = {
    header_status: 401,
    result_code: 38,
    title: 'Unauthorized',
    message: "You are not authenticated to perform this action."
};

errors['RENTAL_CONFLICT'] = {
    header_status: 409,
    result_code: 39,
    title: 'Rental Conflict',
    message: "This vehicle already has an active rental overlapping the requested dates."
};

errors['INVALID_REQUEST'] = {
    header_status: 400,
    result_code: 40,
    title: 'Invalid Request',
    message: "The request is invalid."
};

export { errors, ErrorResponse };