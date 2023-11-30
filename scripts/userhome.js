
let userNameElement = document.querySelector(".user_name");


let accessToken = sessionStorage.getItem("accessToken");

fetch('/profile',{method:'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
}}).then(res=> res.json()).then(data=> console.log(data)).catch(err=> console.log);
  