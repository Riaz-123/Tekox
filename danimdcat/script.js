// =================================================================
// ===== GOOGLE SHEETS SCRIPT URL YAHAN PASTE KAREIN ============
// =================================================================
// Google Sheets se deploy karne ke baad jo script URL milega, usko in " " ke andar paste karein.
const googleSheetScriptURL = 'YAHAN_APNA_GOOGLE_SHEET_SCRIPT_URL_PASTE_KAREIN';
// =================================================================


// =================================================================
// ======================= SAWAL AUR JAWAB =========================
// =================================================================
// Neeche har sawal ka 'answer' property hai. Aap PDF se dekh kar sahi option (a, b, c, ya d) set kar sakte hain.
const quizData = [
    // BIOLOGY
    {
        subject: "Biology",
        question: "Which of the following statements accurately describe the role of the liver in homeostasis? \nI. It converts toxic ammonia into less toxic urea via the ornithine cycle. \nII. It deaminates excess amino acids, producing keto acids that can enter cellular respiration. \nIII. It serves as the primary site for the production of the hormone erythropoietin. \nIV. It plays a key role in the regulation of blood glucose levels by glycogenesis and glycogenolysis.",
        options: ["I and II only", "I, II, and IV only", "II and III only", "I, II, III, and IV"],
        answer: "b" // <-- Sahi Jawab yahan likhein
    },
    {
        subject: "Biology",
        question: "All of the following are correct comparisons between cortical and juxtamedullary nephrons EXCEPT:",
        options: [
            "Cortical nephrons have their renal corpuscles in the outer cortex, while juxtamedullary nephrons have theirs near the corticomedullary junction.",
            "Cortical nephrons have a short loop of Henle, while juxtamedullary nephrons have a long loop extending deep into the medulla.",
            "Cortical nephrons are involved in producing concentrated urine, while juxtamedullary nephrons are not.",
            "Cortical nephrons are more numerous than juxtamedullary nephrons."
        ],
        answer: "c" // <-- Sahi Jawab yahan likhein
    },
    {
        subject: "Biology",
        question: "The diagram shows a negative feedback loop for blood calcium regulation. If blood calcium levels decrease, which hormone is released, and what is its primary effect? (Image for this question is in the PDF)",
        options: [
            "Parathyroid Hormone (PTH); increases bone resorption and calcium reabsorption in kidneys",
            "Calcitonin; decreases bone resorption and increases calcium deposition in bones",
            "Aldosterone; increases sodium and calcium reabsorption in kidneys",
            "ADH; increases water reabsorption to concentrate calcium in blood"
        ],
        answer: "a" // <-- Sahi Jawab yahan likhein
    },
    // Aap baaki ke saare sawal isi format mein yahan add karte jayenge.
    // Maine waqt bachane ke liye sirf 3 sawal add kiye hain.
    // Aap PDF se copy-paste karke poora test bana sakte hain.
    
    // CHEMISTRY EXAMPLE
    {
        subject: "Chemistry",
        question: "The position of sulphur (Z=16) in the Periodic Table is period 3 and group VIA, predicted from its:",
        options: [
            "atomic mass",
            "number of neutrons",
            "valence shell electronic configuration",
            "isotopic composition"
        ],
        answer: "c" // <-- Sahi Jawab yahan likhein
    }
];
// =================================================================
// =================== END OF QUIZ DATA ==========================
// =================================================================


// Website Elements
const userForm = document.getElementById('user-form');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');

const subjectTitle = document.getElementById('subject-title');
const questionNumberEl = document.getElementById('question-number');
const totalQuestionsEl = document.getElementById('total-questions');
const questionTextEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const resultNameEl = document.getElementById('result-name');
const scoreEl = document.getElementById('score');
const feedbackMessageEl = document.getElementById('feedback-message');


// Quiz state variables
let currentQuestionIndex = 0;
let userAnswers = [];
let userName = '';
let userCity = '';

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);


function startQuiz() {
    userName = document.getElementById('userName').value;
    userCity = document.getElementById('userCity').value;

    if (userName.trim() === '' || userCity.trim() === '') {
        alert('Please apna naam aur sheher enter karein.');
        return;
    }

    userForm.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    totalQuestionsEl.textContent = quizData.length;
    userAnswers = new Array(quizData.length).fill(null);
    loadQuestion();
}

function loadQuestion() {
    // Clear previous options
    optionsContainer.innerHTML = '';

    const currentQuestion = quizData[currentQuestionIndex];
    subjectTitle.textContent = currentQuestion.subject;
    questionNumberEl.textContent = currentQuestionIndex + 1;
    questionTextEl.innerHTML = currentQuestion.question.replace(/\n/g, '<br>'); // for line breaks in questions

    // Create option buttons
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        // 'a' is 0, 'b' is 1, etc.
        const optionLetter = String.fromCharCode(97 + index);
        button.textContent = `${optionLetter.toUpperCase()}. ${option}`;
        button.dataset.option = optionLetter;
        button.addEventListener('click', () => selectOption(button, optionLetter));
        optionsContainer.appendChild(button);
    });
    
    // Change button text on last question
    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.textContent = 'Submit Test';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function selectOption(selectedButton, optionLetter) {
    // Remove 'selected' class from all buttons
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    // Add 'selected' class to the clicked button
    selectedButton.classList.add('selected');
    // Store user's answer
    userAnswers[currentQuestionIndex] = optionLetter;
}

function nextQuestion() {
    // Check if an option was selected
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please ek option select karein.');
        return;
    }
    
    // Move to next question or show results
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    
    resultNameEl.textContent = userName;
    scoreEl.textContent = `${score} / ${quizData.length}`;

    // Send data to Google Sheets
    sendDataToGoogleSheet(userName, userCity, score, quizData.length);
}

function sendDataToGoogleSheet(name, city, userScore, totalScore) {
    if (!googleSheetScriptURL || googleSheetScriptURL === 'YAHAN_APNA_GOOGLE_SHEET_SCRIPT_URL_PASTE_KAREIN') {
        feedbackMessageEl.textContent = "Google Sheet URL not configured.";
        return;
    }

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('City', city);
    formData.append('Score', `${userScore}/${totalScore}`);
    formData.append('Timestamp', new Date().toLocaleString());

    fetch(googleSheetScriptURL, { method: 'POST', body: formData })
        .then(response => {
            if (response.ok) {
                feedbackMessageEl.textContent = "Aapka result save ho gaya hai. 👍";
            } else {
                 feedbackMessageEl.textContent = "Result save karne mein masla hua. (Error)";
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            feedbackMessageEl.textContent = "Result save karne mein masla hua. (Network Error)";
        });
}
