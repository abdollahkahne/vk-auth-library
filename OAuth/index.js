const httpClient=require("../Utilities/httpClient.js");


module.exports=(client_id,client_secret,callback)=>{
    // this verifies code and only returns access_token and user_id
    const getAccessToken=(code)=>{
        const url=`https://oauth.vk.com/access_token?client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${callback}&code=${code}`;
        return httpClient(url).then((result)=>{
            if (result.error) {
                throw new Error(result.error);
            }
            return result;
        }).catch(err=>({error:new Error("Invalid Grant"),success:false}));  

    }
    // this return user data using access_token
    const getUserProfile=(user_id,access_token,version="5.130")=>{
        const url=`https://api.vk.com/method/getProfiles?uid=${user_id}&access_token=${access_token}&v=${version}`;
        return httpClient(url).then((result)=>{
            if (result.err) {
                throw result.err;
            } else {
                return result.response[0];
            }
        }).catch(err=>({error:new Error("Invalid Grant"),success:false}));
    }
    // this verify code and return user data too
    const verifyUserData=(code,version="5.130")=>{
        return getAccessToken(code).then(result=>{
            const {access_token,user_id}=result;
            if (!access_token) {
                throw new Error("This code used before");
            }
            return getUserProfile(user_id,access_token,version).then(user=>({access_token,user_id,user}));
        }).catch(err=>({error:new Error("This code used before: Every code can be used once!"),success:false}));
    }
    return {getAccessToken,getUserProfile,verifyUserData};
}