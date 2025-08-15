fetch('https://api.impossible-world.xyz/api/act?number=03027665767')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("API Response:", data);
  })
  .catch(error => {
    console.error("Error calling API:", error);
  });
