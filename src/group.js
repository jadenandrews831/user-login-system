const group = document.querySelector('#group')

const id = window.location.href.split('=')[1];



const xhr = new XMLHttpRequest();
xhr.open("GET", `http://localhost:3000/grp_contacts?id=${id}`);
xhr.send();
xhr.responseType = 'json';
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = xhr.response.data;
    console.log(data);

    let cntcts = ''
    for (let i = 0; i < data.length; i++){
      cntcts += `Name: ${data[i].f_name} ${data[i].l_name}<br>Email: ${data[i].email}<br><br>`
    }

    group.innerHTML = `
    ${cntcts}
    <br>
    <br>
    <h3> eMail: </h3>
    <input type="text" name="email_subj" placeholder="Subject" id="subj" size="52"><br>
    <textarea id="email" name="email" rows="15" cols="50"></textarea><br>
    <button type="button" id="email_btn">Send eMail</button>
    `
  }

  const email = document.querySelector('#email');
  const subj = document.querySelector('#subj')
  const btn = document.querySelector('#email_btn');

  btn.onclick = function() {
    alert('An email is being sent');
    const txt = email.value;
    const sub = subj.value;
    console.log(txt);
    const x = new XMLHttpRequest();
    x.open("POST", `http://localhost:3000/send_email`, true)
    x.setRequestHeader("Content-type", 'application/x-www-form-urlencoded')
    x.send(`email=${txt}&id=${id}&subj=${sub}`)
    x.onload = () => {
      let d = JSON.parse(x.response);
      location.href = d.next.url;
    }
  }
}

