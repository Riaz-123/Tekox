const form = document.getElementById("guardianForm");
const formMessage = document.getElementById("formMessage");
const fatherField = document.getElementById("fatherField");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3j0lg68YuZe4Yq5XsKgZKaPL9UXUbhnIHLPZXnLNBDYM4mZJvaGBaLys4twsANt5K/exec"; // replace

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "Submitting, please wait...";
  formMessage.className = "message loading";

  const studentName = document.getElementById("studentName").value.trim();
  const fatherName = document.getElementById("fatherName").value.trim();
  const guardianName = document.getElementById("guardianName").value.trim();
  const guardianContact = document.getElementById("guardianContact").value.trim();

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({
        studentName,
        fatherName,
        guardianName,
        guardianContact
      }),
    });

    const result = await response.json();

    if (result.status === "duplicate") {
      fatherField.style.display = "block";
      formMessage.textContent = "Multiple students found. Please enter Father Name.";
      formMessage.className = "message error";
    } else if (result.status === "success") {
      formMessage.textContent = "Guardian details updated successfully ✅";
      formMessage.className = "message success";
      form.reset();
      fatherField.style.display = "none";
    } else {
      formMessage.textContent = "Error: " + result.message;
      formMessage.className = "message error";
    }
  } catch (error) {
    formMessage.textContent = "Submission failed. Please try again.";
    formMessage.className = "message error";
  }
});
