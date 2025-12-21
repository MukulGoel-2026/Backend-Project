import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadToCloudinary} from "../utils/coudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken ,refreshToken}

    } catch (error) {
        throw new ApiError(500 ,"something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend 
    //validation - not empty
    //check if user exits: username ,email
    //check for images , avatar
    //upload them to cloudinary , avatar
    //create user object - create entry in db
    //remove password and refresh token from response
    //check for user creation 
    //return response 

    const {username , email , fullname , password} = req.body
    console.log("fullname:" , fullname)

    if(
        [fullname ,username ,email ,password].some((feild) => feild?.trim() === "")
    ){
        throw new ApiError(400 , "all feilds are required")
    }

    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    })

    if(existedUser){
        throw new ApiError(409 , "User with username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path ;
    // const CoverImageLocalPath = req.files?.coverImage[0]?.path ;

    let CoverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        CoverImageLocalPath = req.files.coverImage[0].path;
    }



    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar is required ")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath) ; 
    const coverImage = await uploadToCloudinary(CoverImageLocalPath) ;

    if(!avatar){
        throw new ApiError(400 , "avatar is required ")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" ,
        username: username.toLowerCase(),
        password,
        email,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser){
        throw new ApiError(500 ,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200 , "User registered Succesfully" , createdUser)
    );

})

const loginUser = asyncHandler(async (req ,res) => {
    // request data -> body 
    // username orr email
    // find the user
    // check password 
    // access and refresh token 
    // send cookie

    const { username , email , password } = req.body

    if (!username && !email) {
        throw new ApiError(400 ,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username} , {email}]
    })

    if (!user) {
        throw new ApiError(404 ,"user dose not exist")
    }

    const isPasswordVaild = await user.isPasswordCorrect(password)

    if (!isPasswordVaild) {
        throw new ApiError(401 ,"Invalid user crediantials")
    }

    const {accessToken ,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true ,
        secure: true , 
    }

    return res
    .status(200)
    .cookie("accessToken" ,accessToken ,options )
    .cookie("refreshToken" ,refreshToken ,options)
    .json(
        new ApiResponse(
            200,
            "user logged in successfully",
            {
                user: loggedInUser, accessToken, refreshToken
            }
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req ,res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken ;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unothorized access")
    }

    try {
        const decodedToken = jwt.verify(refreshAccessToken , process.env.REFRESH_TOKEN_SECRET) ;
        
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401 ,"invaild refresh token")
        }
    
        if (decodedToken !== user.refreshToken) {
            throw new ApiError(401 ,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {newRefreshToken , accessToken} = generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" ,accessToken ,options)
        .cookie("refreshToken" , newRefreshToken ,options)
        .json(
            new ApiResponse(
                200 ,
                "access token refreshed successfully",
                {accessToken , refreshToken : newRefreshToken}
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "invaild refresh token")
    }

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} ;