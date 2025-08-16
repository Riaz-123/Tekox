async function fetchData() {
  const number = document.getElementById("number").value.trim();
  const responseBox = document.getElementById("responseBox");
  const shareButton = document.getElementById("shareButton");

  if (!number) {
    alert("INPUT ERROR: NO TARGET SPECIFIED");
    return;
  }

  responseBox.innerHTML = `CONNECTING TO DATABASE... ....`;
  responseBox.style.display = "block";
  shareButton.style.display = "none";

  try {
    const res = await fetch("data.json"); // local file with data
    const apiData = await res.json();

    setTimeout(() => {
      const user = apiData.find(item => item.Mobile === number);

      if (user) {
        const content = `
> DATABASE ENTRY FOUND
> -------------------
📱 MOBILE: ${user.Mobile}
📝 NAME: ${user.Name}
🆔 ID: ${user.ID}
🏠 ADDRESS: ${user.Address}
        `;
        responseBox.innerText = content;
        shareButton.style.display = "inline-block";
      } else {
        responseBox.innerHTML = `>> ERROR 404: DATA NOT FOUND`;
      }
    }, 1200);
  } catch (e) {
    setTimeout(() => {
      responseBox.innerHTML = `>> SYSTEM ERROR: CONNECTION FAILED`;
    }, 1200);
  }
}
