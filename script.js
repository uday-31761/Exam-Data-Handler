document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("searchInput").addEventListener("input", searchTable);
document.getElementById("filterButton").addEventListener("click", goToFilterPage);
document.getElementById("visualizeButton").addEventListener("click", visualizeData);

let tableData = []; // Store the data from the Excel file
let chartInstance = null; // To store the chart instance for cleanup

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    tableData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    displayTable(tableData);

    // Show controls after data is loaded
    document.getElementById("controls").style.display = "flex";
  };

  reader.readAsArrayBuffer(file);
}

function displayTable(data) {
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");

  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";

  if (data.length === 0) return;

  // Populate table headers
  data[0].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    tableHeader.appendChild(th);
  });

  // Populate table rows
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function searchTable() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach((row) => {
    const cells = Array.from(row.children);
    const match = cells.some((cell) =>
      cell.textContent.toLowerCase().includes(query)
    );
    row.style.display = match ? "" : "none";
  });
}

function goToFilterPage() {
  if (!tableData || tableData.length === 0) {
    alert("No data loaded. Please upload a file first.");
    return;
  }
  // Save the table data to localStorage
  localStorage.setItem("tableData", JSON.stringify(tableData));
  // Navigate to the filter page
  window.location.href = "filter.html"; // Ensure filter.html exists in the same directory
}

function visualizeData() {
  if (!tableData || tableData.length === 0) {
    alert("No data loaded. Please upload a file first.");
    return;
  }

  const numericColumns = [];
  const yesNoColumns = [];
  const headers = tableData[0];

  // Identify numeric and yes/no columns
  headers.forEach((header, index) => {
    const columnData = tableData.slice(1).map((row) => row[index]);
    if (columnData.every((value) => !isNaN(value) && value !== "")) {
      numericColumns.push({ header, data: columnData.map(Number) });
    } else if (
      columnData.every(
        (value) =>
          value.toString().toLowerCase() === "yes" ||
          value.toString().toLowerCase() === "no"
      )
    ) {
      yesNoColumns.push({ header, data: columnData });
    }
  });

  // Clear the previous chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById("chart").getContext("2d");

  // Combine numeric and yes/no columns into one chart
  const datasets = [];

  // Add numeric columns to the datasets
  numericColumns.forEach((col) => {
    datasets.push({
      label: col.header,
      data: col.data,
      backgroundColor: "#36A2EB",
    });
  });

  // Add yes/no columns to the datasets
  yesNoColumns.forEach((col) => {
    const yesCount = col.data.filter((value) => value.toLowerCase() === "yes")
      .length;
    const noCount = col.data.filter((value) => value.toLowerCase() === "no")
      .length;
    datasets.push({
      label: col.header,
      data: [yesCount, noCount],
      backgroundColor: ["#FF6384", "#4BC0C0"],
    });
  });

  chartInstance = new Chart(ctx, {
    type: "bar", // Use bar chart for combined visualization
    data: {
      labels: numericColumns.map((col) => col.header).concat(
        yesNoColumns.map((col) => col.header)
      ),
      datasets: datasets,
    },
  });
}   
