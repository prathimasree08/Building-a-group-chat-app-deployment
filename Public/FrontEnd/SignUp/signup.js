const myForm = document.querySelector('.signup-form');
const msg = document.querySelector('.msg')
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const mobileInput = document.querySelector('#mobile');
const passwordInput = document.querySelector('#password')

myForm.addEventListener('submit', onSubmit);

async function onSubmit(e){
    e.preventDefault();
    try{
            const newuser = {
                name: nameInput.value,
                email: emailInput.value,
                mobile: mobileInput.value,
                password: passwordInput.value
            }
            const response = await axios.post('http://localhost:3000/user/signup', newuser)
            console.log(response)
            if(response.status === 200){
                alert("Successfuly signed up.")
                window.location.href = "../Login/login.html"
            }else{
                throw new Error('Failed to login')
            }
        } catch(err) {
        // console.log(err)
        msg.classList.add('warning');
        msg.textContent = err.response.data.error;
        setTimeout(() => msg.remove(), 3000);
    } 
}