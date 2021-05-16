This package supports two different type of Server-Side Authentication/Authorization Using VK.
1-OAuth
2-Open API (OpenID)
For more information about other type of authentication and information abouth them in VK please visit this [discussion](https://github.com/abdollahkahne/Auth/discussions/2) in GitHub

### OAuth 
The client side implementation of this method is described in an article at VK: [Authorization Cod Flow](https://vk.com/dev/authcode_flow_user)

For Complete Server-Side OAuth Authorization the following Steps should be done:
1- First you should create a link in your code and handle it using button onClick event handler/anchor `href`. This link is in the following format:

`https://oauth.vk.com/authorize?client_id=1&display=page&redirect_uri=http://example.com/callback&scope=friends&response_type=code&v=5.130`

You can read important noted about this link in VK development documents but consider that `redirect_uri` and `response_type` are the most important here. `redirect_uri` should be first set at App setting in VK and this is the route that you handle server-side part of work. Also you should set r`esponse_type=code` to be able to run APIs in Server. Otherwise in (`response_type=token`) the token only can be used at the same ip.

2- In controller/middlewares implemented for the `redirect_uri `you can implement the following to verify the Authentication and simulatenousely get the user data directly from VK in the backend not from the client side:

```
const {OAuthClient}=require("vk-auth-library");

const client=OAuthClient(client_id,client_secret,redirect_uri);
```
then use the created client to get `access_token` and `user_id` and `user` data in the following way:

```
client.verifyUserData(code).then(result=>{
    const {user_id,access_token,user}=result;
});
```

 Note that you can only use the received code from the VK once and after that, it is expired. So if you plan to use other API methods too, use the following method first to get `access_token` and `user_id`  and then use that **token** and **user id** to do other API method calls.
```
client.getAccessToken(code).then(result=>{
    const {user_id,access_token}=result;
});
```
Here you can get User Info from the API or using the following method:
`const user=await client.getUserProfile(user_id,access_token);`

All the three method return **promises** so can be used using `await` or `then/catch `block to handle the result.


### Open ID
To use Open ID version of VK Authentication you should first add the js library which developed by VK as follow. you can use it in main index.html  inside the body tag (and above other js framework code). You can get the implementation of this method in VK dev [here](https://vk.com/dev/openapi?f=2.1.%20Usual%20Initialization).
In front end you should firt add this library:

`<script src="//vk.com/js/api/openapi.js" type="text/javascript"></script>`

Then you should initialize it somewhere. for example in React code you can init it at `componentDidMount` life cycle. it initialize as below:
```
VK.init({
    apiId: YOUR_APP_ID
  });
```
Then for login you should add a button for example and add the following code:
```
VK.Auth.login(function(response) {
      const {session:{expire,mid,secret,sid,sig}}=response;
      if (session) {
        fetch(`/auth/vk`, {
              credentials: "include",
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ data: {{expire,mid,secret,sid,sig}} }),
        })
```
Here callback function in login should send the session data to backend. 
In the back you should add the library and use it as below:

```
const {OpenIDClient}=require("vk-auth-library");

const client=OpenIDClient(client_id,client_secret,service_token);
```
Here we can do three things:
1- Verify Login: this do using the boolean function `client.verifySignature({expire,mid,secret,sid,sig})`;

2- Get User Data from VK: ` const user=client.getUserProfile(mid);`

3- Verify Login and Get User Data `client.verifyUserData({expire,mid,secret,sid,sig}).then(result=>{let user=result});`


