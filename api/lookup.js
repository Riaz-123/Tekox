export default async function handler(req, res) {

  try {

    const phone = req.query.phone;

    if(!phone){
        return res.status(400).send("Phone missing");
    }

    const apiUrl =
      "https://legendxdata.site/Api/simdata.php?phone=" + phone;

    const response = await fetch(apiUrl);
    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(data);

  } catch (err) {
    res.status(500).send("Server Error");
  }
}
