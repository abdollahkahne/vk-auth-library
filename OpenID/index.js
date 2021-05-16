const httpClient=require("../Utilities/httpClient.js");
const crypto=require("crypto");


module.exports=(client_id,client_secret,service_token)=>{
    // this verifies code and only returns access_token and user_id
    const verifySignature=({expire,mid,secret,sid,sig})=>{
        const payload = `expire=${expire}mid=${mid}secret=${secret}sid=${sid}${client_secret}`;
        const hashedPayload=crypto.createHash("md5").update(payload).digest("hex");
        return (hashedPayload===sig); 

    }

    // this resturns a token which works in behalf of Application like service token but only for secure Methods
    //for Open Methods like users.get we should use service methods
    // All methods needs access token in last version of VK Auth Some needs Services Token, Secure method needs to get
    // secure token and Other which run on behalf of a user/community needs user or community token
    const getSecureToken=()=>{
        const url=`https://oauth.vk.com/access_token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`;
        return httpClient(url).then((result)=>{
            const {access_token}=result;
            if (access_token) {
                return access_token;
            } else {
                throw new Error("Something Wrong happened");
            }
        });
    }
    // this return user data in behalf of App (and not loggedIn User)
    const getUserProfile=async (user_id,version="5.130")=>{
        // Do not trust Client side User info altough user_id which sends in session is included in Signature
        const url=`https://api.vk.com/method/users.get?user_ids=${user_id}&access_token=${service_token}&v=${version}`;
        return httpClient(url).then((result)=>{
            if (result.err) {
                throw result.err;
            } else {
                return result.response[0];
            }
        }).catch(err=>({error:new Error("Invalid Grant"),success:false}));
    }
    // this verify code and return user data too
    const verifyUserData=({expire,mid,secret,sid,sig},version="5.130")=>{
        if (verifySignature({expire,mid,secret,sid,sig})) {
            return getUserProfile(mid,version).then(user=>({success:true,user})).catch(err=>({success:false,error:err}));
        }
        return new Promise((resolve,reject)=>resolve({success:false,error:"No user is authenticated correctly"}));
    }
    return {verifySignature,getUserProfile,verifyUserData};
}