const group_div = document.querySelector('.groups');

const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:3000/get_groups");
xhr.send();
xhr.responseType = 'json';
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = xhr.response;
    group_div.innerHTML = `
    <h1>${data.groups}</h1>
    <a href="/groups/group">+ new group</a>
    `
  } else {
    console.log(`Error: ${xhr.status}`);
  }
}

