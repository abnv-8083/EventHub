import HTTP_STATUS from "../constants/statusCode.js"
import {sendResponse, sendConfirmation} from "../utils/responseHandler.js"
const isAuthenticated = (req,res,next)=>{
    if(!req.session.user || !req.session){
        sendResponse(res,HTTP_STATUS.BAD_REQUEST,false,'Please Login First')
        return false
    }else{
        next()
    }
}

export default isAuthenticated