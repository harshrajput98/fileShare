const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "https://fileshare-0bt3.onrender.com";
const uploadURL = `${baseURL}/upload`;
const emailURL = `${baseURL}/send`;

const maxAllowedSize = 100 * 1024 * 1024; // 100MB

// Open file input when browse button is clicked
browseBtn.addEventListener("click", () => {
  fileInput.click();
});

// Handle drag and drop of files
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});

// Handle file selection via input
fileInput.addEventListener("change", () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input
    return;
  }
  uploadFile();
});

// Copy the file URL to clipboard
copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
  fileURL.select();
});

// Function to handle file upload
const uploadFile = () => {
  console.log("file added uploading");

  const files = fileInput.files;
  const formData = new FormData();
  formData.append("myfile", files[0]);

  // Show the uploader
  progressContainer.style.display = "block";

  const xhr = new XMLHttpRequest();

  // Listen for upload progress
  xhr.upload.onprogress = function (event) {
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // Handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // Reset the input
  };

  // Handle server response
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {  // Check if the upload was successful
        try {
          const res = JSON.parse(xhr.responseText);  // Parse the JSON response
          if (res.file) {
            fileURL.value = res.file; // Set the file URL in the input field
            showToast("File uploaded successfully");
            console.log("File uploaded successfully")
            sharingContainer.style.display = "block"; // Show sharing container
            progressContainer.style.display = "none"; // Hide progress container when done
          } else {
            showToast("No file URL found in the response");
          }
        } catch (e) {
          console.error("Error parsing the response:", e);
          showToast("Error in file upload response");
        }
      } else {
        showToast("Failed to upload the file");
      }
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);  // Send the form data to the server
};

// Function to handle showing toast messages
let toastTimer;
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};

// Handle email form submission
emailForm.addEventListener("submit", (e) => {
  e.preventDefault();  // stop submission

  // Disable the button to prevent multiple submissions
  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";

  const url = fileURL.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0], // Extract file UUID from URL
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none"; // Hide sharing box after email sent
      }
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      showToast("Failed to send email");
    });
});
