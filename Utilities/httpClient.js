const https=require("https");

module.exports=(url)=>{
    return new Promise((resolve,reject)=>{
        https.get(url, (resp) => {
            let data = '';
        
          // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });
        
          // The whole response has been received. Print out the result.
            resp.on('end', () => {
                const result=JSON.parse(data);
                resolve(result);
            // console.log(JSON.parse(data).explanation);
            });
        
            }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);
            });
    });
    
}