
let loginButton = document.querySelector(".login_button");

loginButton.addEventListener("click",()=>{
    let userSSN = document.querySelector(".SSN").value; 
    let userPassword = document.querySelector(".password").value;

    let accessToken;

    fetch('/auth',{method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({SSN: '150222', password: '123'})
    }).then(res=> res.json()).then(res=> accessToken = res.accessToken).then(()=>{
        localStorage.setItem("accessToken", accessToken);
        fetch('/userhome', {method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }}).then(res=> console.log(res.url));
    }).catch(err=>console.log);

    //console.log(accessToken);


});



