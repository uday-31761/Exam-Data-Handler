/* script.js */
let tableData = [];

document.getElementById("showDataBtn").addEventListener("click", () => {
  document.getElementById("initialView").classList.add("hidden");
  document.getElementById("controls").classList.remove("hidden");
});

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    tableData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    displayTable(tableData);
  };
  reader.readAsArrayBuffer(file);
});

function displayTable(data) {
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";

  data[0].forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    tableHeader.appendChild(th);
  });

  data.slice(1).forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

document.getElementById("searchInput").addEventListener("input", () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const match = Array.from(row.children).some(td => td.textContent.toLowerCase().includes(query));
    row.style.display = match ? "" : "none";
  });
});
