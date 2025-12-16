import { request } from "express" ;

const asyncHandler = (requestHandler) => {
    (res , req, next) => {
        Promise.resolve(requestHandler(res , req, next)).catch((error) => next (error)); ;
    }
}

export default asyncHandler ;