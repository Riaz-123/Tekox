fetch('/api/activation?num=03027665767&otp=5674')
  .then(res => res.json())
  .then(data => console.log(data));
