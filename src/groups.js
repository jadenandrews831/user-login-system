const group_div = document.querySelector('.groups');

const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:3000/get_groups");
xhr.send();
xhr.responseType = 'json';
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = xhr.response;
    let grps = `<div id="groups">`
    for (let i = 0; i < data.groups.length; i++){
      let group = data.groups[i];
      console.log('Group:', group)
      grps += `<a href="http://localhost:3000/group?id=${group.g_id}"><div class="sub_groups" id=${group.g_id}> <h3>${group.g_name}</h3>`
      let x = new XMLHttpRequest();
      x.open('GET', `http://localhost:3000/contacts?id=${group.g_id}`, false);
      x.send(null);
      if (x.status === 200 && x.readyState == 4) {
        let r = JSON.parse(x.response);
        for (let i = 0; i < Math.min(3, r.data.length); i++){
          grps += `${r.data[i].f_name}
          ${r.data[i].l_name}<br>
          ${r.data[i].email}<br><br>`
        }
        grps += `</div></a>`
        console.log('Contacts:', JSON.stringify(r))
        console.log('current grp:', grps)
      }
    }
    
    grps += '</div>'

    console.log('Groups', grps)
    group_div.innerHTML = `
    ${grps}
    <a href="/add_group">+ new group</a>
    `
  } else {
    console.log(`Error: ${xhr.status}`);
  }
}

