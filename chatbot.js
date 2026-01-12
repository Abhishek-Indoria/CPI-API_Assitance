function calculate() {
  // ---- READ DOM (ALIGNED TO index.html) ----
  const contractNature = document.getElementById("contractNature").value;
  const increaseType = document.getElementById("increaseType").value;

  const initialStartValue = document.getElementById("contractStartDate").value;
  if (!initialStartValue) {
    alert("Initial Contract Start Date is required");
    return;
  }

  const initialStartDate = new Date(initialStartValue);

  let startDate = initialStartDate;

  if (contractNature === "Upsell") {
    const upsellStartValue = document.getElementById("upsellStartDate").value;
    if (!upsellStartValue) {
      alert("Upsell Start Date is required");
      return;
    }
    startDate = new Date(upsellStartValue);
  }

  const basePrice = parseFloat(document.getElementById("basePrice").value);
  const cpiRate =
    parseFloat(document.getElementById("increasePercent").value) / 100;
  const termYears = parseInt(document.getElementById("contractTerm").value);

  if (!basePrice || !termYears) {
    alert("Please fill Base Price and Contract Term");
    return;
  }

  const expectedISPInput =
    document.getElementById("expectedISP").value;

  const yearlyBody = document.querySelector("#yearlyTable tbody");
  const quarterlyBody = document.querySelector("#quarterlyTable tbody");

  yearlyBody.innerHTML = "";
  quarterlyBody.innerHTML = "";

  let annualPrice = basePrice;
  let totalCalculatedISP = 0;

  for (let year = 1; year <= termYears; year++) {
    let yearStart = new Date(startDate);
    yearStart.setFullYear(startDate.getFullYear() + year - 1);

    let yearEnd = new Date(yearStart);
    yearEnd.setFullYear(yearEnd.getFullYear() + 1);
    yearEnd.setDate(yearEnd.getDate() - 1);

    // 🔒 FLAT PER TERM (LOCKED)
    if (increaseType === "Flat per term") {
      annualPrice = basePrice;
    }

    // 🔒 FLAT PER ANNUM (LOCKED)
    if (increaseType === "Flat per annum") {
      if (year > 1) {
        annualPrice = annualPrice * (1 + cpiRate);
      }
    }

    annualPrice = Number(annualPrice.toFixed(2));
    totalCalculatedISP += annualPrice;

    yearlyBody.innerHTML += `
      <tr>
        <td>${formatDate(yearStart)}</td>
        <td>${formatDate(yearEnd)}</td>
        <td>${annualPrice.toFixed(2)}</td>
      </tr>
    `;

    // Quarterly
    let qStart = new Date(yearStart);
    for (let q = 0; q < 4; q++) {
      let qEnd = new Date(qStart);
      qEnd.setMonth(qEnd.getMonth() + 3);
      qEnd.setDate(qEnd.getDate() - 1);

      quarterlyBody.innerHTML += `
        <tr>
          <td>${formatDate(qStart)}</td>
          <td>${formatDate(qEnd)}</td>
          <td>${(annualPrice / 4).toFixed(2)}</td>
        </tr>
      `;

      qStart.setMonth(qStart.getMonth() + 3);
    }
  }

  // ---- ISP VALIDATION ----
  const ispDiv = document.getElementById("ispValidation");
  ispDiv.innerHTML = "";

  if (expectedISPInput) {
    const expectedISP = parseFloat(expectedISPInput);
    const diff = Math.abs(expectedISP - totalCalculatedISP);

    if (diff < 0.01) {
      ispDiv.style.color = "green";
      ispDiv.innerText =
        `✅ ISP Match: ${totalCalculatedISP.toFixed(2)}`;
    } else {
      ispDiv.style.color = "red";
      ispDiv.innerText =
        `⚠ ISP Mismatch: Calculated = ${totalCalculatedISP.toFixed(2)}, Expected = ${expectedISP.toFixed(2)}`;
    }
  }
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// UI toggle
document.getElementById("contractNature").addEventListener("change", () => {
  document.getElementById("upsellFields").style.display =
    document.getElementById("contractNature").value === "Upsell"
      ? "block"
      : "none";
});