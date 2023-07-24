const sendBtn = document.getElementById('sendmsg');
const chatMsg = document.getElementById('chat-msg');
const chatBox = document.getElementById('chat-box');
const groupName = document.getElementById('create-group');
const addBtn = document.getElementById('add-group');
const chatGroup = document.getElementById('chat-user-group');
const token = localStorage.getItem('token');
const mobileInput = document.getElementById('invite-users-input');
const addUser = document.getElementById('adduser');
const logoutBtn = document.getElementById('logout');
const picBtn = document.getElementById('multimedia');

const socket = io('http://localhost:4000');

let currentGroupId = null;
let currentUser;
let userId;
let userli=[];

addBtn.addEventListener('click', addNewGroup);
sendBtn.addEventListener('click', sendChat)

socket.on('connect', () => {
  console.log('User connected');
});

socket.on('disconnect', () => {
  console.log('User disconnected');
});

socket.on('newChat', (chat) => {
  if(chat.groupId === currentGroupId){
    // console.log(chat)
    showchats(chat);
  }
  chatBox.scrollTop = chatBox.scrollHeight;
});

function chatRefresh(){
  try{
    socket.emit('joinRoom', currentGroupId);
  }catch(err){
    console.log(err)
  }
}

picBtn.addEventListener('click', function(e) {
  e.preventDefault()
  const fileInput = document.getElementById('file-input');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    console.error('No file selected!');
    return;
  }
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  // console.log(formData)
  socket.emit('sendChat', {
    groupId: currentGroupId,
    userName: currentUser,
    file: file,
    userId: userId
  }, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('File sent successfully!');
    }
  });
  chatMsg.value = '';
  fileInput.value = '';
});

async function sendChat(e){
    e.preventDefault()
    try{
      socket.emit('sendChat', {
        groupId: currentGroupId,
        userName: currentUser,
        message: chatMsg.value,
        userId: userId
      });
      const newChat = {
        message: chatMsg.value
    }
    const response = await axios.post(`http://localhost:3000/chat/chats/${currentGroupId}`, newChat,{
         headers: {
            "Authorization" : token 
        }
    });
    // showDbChats(response.data )
      chatMsg.value = ""
      
    }catch (err){
        console.log(err)
    }
    
}

function showDbChats(chat) {
  const li = document.createElement('li');
  const messageLink = document.createElement('a')
  messageLink.href = '#';
  messageLink.textContent = chat.message;
  messageLink.onclick = () => {
    window.open(`${chat.message}`);
  };
  // console.log(chat)
    li.className= 'list-group-item'
    // li.setAttribute('id', chat.id);
    const textNode= `${chat.user.name}:`
    messageLink.textContent = chat.message
    li.appendChild(document.createTextNode(textNode));
    li.appendChild(messageLink)
    chatBox.appendChild(li);
}

logoutBtn.addEventListener('click', ()=>{
  window.location.href = '../Login/login.html';
  localStorage.removeItem('token');
})

async function loggedInUser(){
  try{
    const name =  await axios.get(`http://localhost:3000/user/name`, { headers: {"Authorization" : token }});
    // console.log(name)
    userId = name.data.userId
    currentUser = name.data.name
  }catch{
    console.log(err)
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const groups = await axios.get(`http://localhost:3000/group/usergroup`, { headers: {"Authorization" : token }});
    // console.log(groups)
    groups.data.forEach(async(group) => {
      showGroup(group);
    });
    loggedInUser()

  } catch (err) {
    console.error(err);
  }
});

let groupId;

chatGroup.addEventListener('click', async (event) => {
  
  groupId = event.target.getAttribute('data-group-id');
  if (groupId) {
    currentGroupId = groupId;
    chatBox.innerHTML = '';
    removeFromScreen();

    const chats = await axios.get(`http://localhost:3000/chat/chats/${groupId}`, { headers: {"Authorization" : token }});
    // console.log(chats)
    chats.data.forEach((chat) => {
      showDbChats(chat);
    });

    const User = await axios.get(`http://localhost:3000/group/getuser/${currentGroupId}`, { headers: {"Authorization" : token }});
    // console.log(User)
    User.data.forEach(async(user) => {
      const status = await isAdmin()
      if (status === 200){
        adminUser(user)
        addUser.style.display = 'block';
        mobileInput.style.display = 'block';
      }else{
        showUsers(user);
      }
      
    });
    chatRefresh()
    
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function removeFromScreen(){
  userli.forEach(li => {
      chatGroup.removeChild(li);
    });
    // clear the displayedExpenses array
    userli.length = 0;
}

async function addNewGroup(e){
    e.preventDefault()
    try{
      const newgroup = {
        name: groupName.value
    }
    // console.log(newgroup)

    const response = await axios.post(`http://localhost:3000/group/newgroup`, newgroup, {
       headers: {
        "Authorization" : token 
      }
      })
    // console.log(response)
    showGroup(newgroup)
    }catch(err){
      console.log(err)
    }
   
}

async function showGroup(group) {
  const linkTab = document.createElement('a');
  linkTab.className = 'btn btn-primary btn-lg btn-block';
  linkTab.setAttribute('data-group-id', group.id);
  const textNode = document.createTextNode(group.name);
  linkTab.appendChild(textNode);
  chatGroup.appendChild(linkTab);
}

function showchats(chat) {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  // console.log(chat)

  if (chat.file) {
    const fileLink = document.createElement('a');
    fileLink.href = chat.file.fileUrl;
    fileLink.textContent = chat.file.fileUrl;
    const textNode = `${chat.userName}:`
    li.appendChild(document.createTextNode(textNode));
    li.appendChild(fileLink)
  } else {
    const textNode = `${chat.userName}: ${chat.message}`;
    li.appendChild(document.createTextNode(textNode));
  }

  chatBox.appendChild(li);
}

async function showUsers(user) {
    const li = document.createElement('li');
    li.className= 'list-group-item'
    li.setAttribute('id', user.id);
    const textNode= `${user.name}`
    li.appendChild(document.createTextNode(textNode));
    li.style.color = 'black'
    userli.push(li)
    chatGroup.appendChild(li);
}

function adminUser(user){
  const li = document.createElement('li');
  li.className= 'list-group-item'
  li.setAttribute('id', user.id);
  const textNode= `${user.name}`
  li.appendChild(document.createTextNode(textNode));
  li.style.color = 'black'
  userli.push(li)
  chatGroup.appendChild(li);
  const removeButton = document.createElement('button');
  removeButton.className = 'btn btn-danger';
  removeButton.innerHTML = 'Remove';

  removeButton.addEventListener('click', async(e) => {
    try{
      var li= e.target.parentElement;
      const id = li.id;
      const response = await axios.delete(`http://localhost:3000/user/delete/${id}/${currentGroupId}`,{
        headers: {
            "Authorization" : token 
        }
      })
      // console.log(response)
      window.location.reload()
      }catch(err){
        console.log(err)
      }
   });
  li.appendChild(removeButton);
  chatGroup.appendChild(li);
}

addUser.addEventListener('click', async(e) => {
  e.preventDefault()
  try{
    const mobile= {
      mobile: mobileInput.value
    }
    const response = await axios.post(`http://localhost:3000/user/adduser/${currentGroupId}`, mobile,{
      headers: {
         "Authorization" : token 
      }
    })
    window.location.reload()
    //  console.log(response)
    showUsers(response.data)
  }catch(err){
      console.log(err)
    }
});

async function isAdmin(){
  try{
      const response = await axios.get(`http://localhost:3000/user/admin/${currentGroupId}`,{
        headers: {
           "Authorization" : token 
       }
      })
      // console.log(response)
      return response.status
  }catch(err){
    console.log(err)
  }
}