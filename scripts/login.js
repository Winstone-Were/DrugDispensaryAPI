
let loginButton = document.querySelector(".login_button");

loginButton.addEventListener("click",()=>{
    let userSSN = document.querySelector(".SSN").value; 
    let userPassword = document.querySelector(".password").value;

    let accessToken;
    let url;

    fetch('/auth',{method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({SSN: '150222', password: '123'})
    }).then(res=> res.json()).then(res=> {
        accessToken = res.accessToken;
        usertype = res.userType;

        if(usertype == 'admin') {
            url = '/adminhome';
        }else{
            url = '/userhome';
        }

    }).then(()=>{
        sessionStorage.setItem("accessToken", accessToken);
        //apply logic to know whether is user or Admin
        
                        let link = document.createElement("a");
                        link.href = url;
                        document.body.appendChild(link);
                        link.click();
                    
    }).catch(err=>console.log);

    //console.log(accessToken); d
});



