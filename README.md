This package supports two different type of Server-Side Authentication/Authorization Using VK.

1-**OAuth** (For a simple example see [this](https://github.com/abdollahkahne/vk-oauth-sample)): This can be used for Both authentication and authorization. With this method you specify a callback for your app first. Int the client-side you only add a link to VK Authorize endpoint as described below. In Server-Side you implement the **callback-uri you specify for your app** and get an access token and user information. If you want to use other VK API in **server-side** (in behalf of user), you can use that access token there. So it is some sort of Authorization too.

2-**Open API (OpenID)** (As an simple example see [this](https://github.com/abdollahkahne/vk-openapi-sample) ): This only used for authentication in server-side. Here you can add an script from VK to client side and then for verification you can implement an API at the backend (**with arbitary url**) and verify user login in server-side and also get User Info (In behalf of your app). In this case if you want call other API you can only use the VK Script at **client-side** (in behalf of user)

For more information about other type of authentication and information abouth them in VK please visit this [discussion](https://github.com/abdollahkahne/Auth/discussions/2) in GitHub

### OAuth
The client side implementation of this method is described in an article at VK: [Authorization Code Flow](https://vk.com/dev/authcode_flow_user). 

For Complete **Server-Side OAuth Authentication/Authorization** the following Steps should be done:

1- In **client-side**, you create a hyperlink in your UI in the form of `a` or `button`. This link is in the following format:

`https://oauth.vk.com/authorize?client_id=1&display=page&redirect_uri=http://example.com/callback&scope=friends&response_type=code&v=5.130`

You can read important notes about this link in [here]((https://vk.com/dev/authcode_flow_user)), but consider that `redirect_uri` and `response_type` are the most important here. `redirect_uri` should be first set at App setting in VK and this is the route that you handle server-side part of work. Also you should set `response_type=code` to be able to run APIs in Server (for example to verify request genuinety). 


2- In **Server-Side** the `redirect_uri` you specified in link should be implemented. Here is where this package comes to work. we use the following code to verify the Authentication and simulatenousely get the user data directly from VK in the backend and not from the client side:


```
const {OAuthClient}=require("vk-auth-library");

const client=OAuthClient(client_id,client_secret,redirect_uri);
```

note that here the `redirect_uri` should be same as what is used in the client side and also what is defined in App setting.

then use the created **client** to get `access_token` and `user_id` and `user` data in the following way (you also get a access_token here for further API_requests in behlaf of User):


```
client.verifyUserData(code).then(result=>{
    const {user_id,access_token,user}=result;
});
```

 Note that **you can only use the received code from the VK once** and after that, it is expired.
 
  So if you plan to use other API methods later **in Server and in Behalf of User**, save the received `access_token` and `user_id` in a variable for more use.
  
  As an alternative, can get this token with the following code too and then use the API Call to get User General Information (first_name,last_name,id)

```
client.getAccessToken(code).then(result=>{
    const {user_id,access_token}=result;
});
```

If You have access_token and user_id, you can get the general User Info using the following method too:
`const user=await client.getUserProfile(user_id,access_token);`


All the three method return **promises** so can be used using `await` or `then/catch `block to handle the result.


### Open ID
To use Open ID version of VK Authentication you should first add the js library which developed by VK as follow. you can use it in main index.html  inside the body tag (and above other js framework code). You can get the implementation of this method in VK dev [here](https://vk.com/dev/openapi?f=2.1.%20Usual%20Initialization).
So the following steps should be done here:
1- In **front end (Client-Side)** you should firt add this script tag inside body somewhere:

`<script src="//vk.com/js/api/openapi.js" type="text/javascript"></script>`

Then you should initialize it somewhere (in a `script` tag in `index.html` or for example in React code you can init it at `componentDidMount` life cycle of Component). it initialize as below:

```
VK.init({
    apiId: YOUR_APP_ID
  });
```

Then for login you should add a button for example and add the following code:

```
VK.Auth.login(function(response) {
      const {session:{expire,mid,secret,sid,sig}}=response;
      if (sig) {
        fetch(`/auth/vk`, {
              credentials: "include",
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ data: {{expire,mid,secret,sid,sig}} }),
        },permissionScope)
```

Here callback function run after the success full login. in the permissionScope you can **optionally** sepcify an integer for permission level (Default is zero and by default you will access general user information after login but you can set other integer too according to VK permission scope masks).


2- In the back (**Server-Side**) you should add the library and use it as below:


```
const {OpenIDClient}=require("vk-auth-library");

const client=OpenIDClient(client_id,client_secret,service_token);
```

Here we can do three things:
1- Verify Login and Get User Data:
`client.verifyUserData({expire,mid,secret,sid,sig}).then(result=>{let {user}=result});`


2- Only Verify Login (Use the user info that you get at client-side or get user info by an additional method which defined in 3): this do using the boolean function:

`client.verifySignature({expire,mid,secret,sid,sig})`;

3- Get User Data from VK ( This is done in behalf of App):

` const user=client.getUserProfile(mid);`


If you want to call other API's you can call them in behalf of App in server using the service code or in client side in behalf of loggedIn User using the following method:

`VK.Api.call(methodName,params,callback)`



