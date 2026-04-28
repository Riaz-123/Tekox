export default async function handler(req, res) {
  try {
    const phone = req.query.phone;

    if (!phone) {
      return res.status(400).send("Phone missing");
    }

    // Set headers for CORS and JSON response
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // --- EASTER EGG / FUNNY OVERRIDE ---
    if (phone === "03181393964") {
      return res.status(200).json({
        name: "Chief Meme Officer",
        cnic: "420420-696969-0",
        address: "123 Chuckle Street, Laughabad",
        network: "Tele-Joke",
        status: "Currently hiding from serious people",
        secret_talent: "Can eat a whole pizza in under 2 minutes",
        warning: "Highly contagious laughter detected on this line",
        credit: "Riaz Hussain"
      });
    }
    // -----------------------------------

    const apiUrl = "https://fam-official.serv00.net/api/famdatabase.php?number=" + phone;

    const response = await fetch(apiUrl);
    const rawData = await response.text();

    let finalData;

    try {
      // Attempt to parse the data as JSON if the external API returns it
      finalData = JSON.parse(rawData);
      
      // If it's an object, we add the credit field directly
      if (typeof finalData === 'object' && finalData !== null) {
        finalData.credit = "Riaz Hussain";
      } else {
        // If it's a simple value (like a number or boolean), wrap it
        finalData = { result: finalData, credit: "Riaz Hussain" };
      }
    } catch (e) {
      // If the data is plain text/HTML, wrap it in a JSON object
      finalData = {
        result: rawData,
        credit: "Riaz Hussain"
      };
    }

    // Send the modified result
    res.status(200).json(finalData);

  } catch (err) {
    res.status(500).send("Server Error");
  }
}
