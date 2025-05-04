// overview.js
(async () => {
  let data = await dbQuery("SELECT * FROM studen");

  addToPage(`
    <h2>Interaktiv analys av psykisk hälsa</h2>
    <label for="genderSelect">Välj kön:</label>
    <select id="genderSelect">
      <option value="All">Alla</option>
      <option value="Male">Man</option>
      <option value="Female">Kvinna</option>
    </select>

    <label for="citySelect">Välj stad:</label>
    <select id="citySelect">
      <option value="All">Alla</option>
      ${[...new Set(data.map((x) => x.City))]
        .slice(0, 10)
        .map((city) => `<option value="${city}">${city}</option>`)
        .join("")}
    </select>

    <div id="chartContainer" style="margin-top:20px;"></div>
    <div id="chartText" style="margin-bottom:20px;"></div>
    <div id="normalDistContainer" style="margin-top:40px;"></div>
    <div id="normalDistText" style="margin-bottom:20px;"></div>
    <div id="correlationContainer" style="margin-top:40px;"></div>
    <div id="correlationText" style="margin-bottom:20px;"></div>
    <div id="summaryText" style="margin-top:40px; font-weight: bold;"></div>
  `);

  document
    .getElementById("genderSelect")
    .addEventListener("change", updateChart);
  document.getElementById("citySelect").addEventListener("change", updateChart);

  function updateChart() {
    let genderFilter = document.getElementById("genderSelect").value;
    let cityFilter = document.getElementById("citySelect").value;

    let filteredData = data.filter((row) => {
      let genderMatch = genderFilter === "All" || row.Gender === genderFilter;
      let cityMatch = cityFilter === "All" || row.City === cityFilter;
      return genderMatch && cityMatch;
    });

    let total = filteredData.length;
    let antalDepression = filteredData.filter(
      (x) => Number(x.Depression) === 1
    ).length;
    let ingenDepression = total - antalDepression;

    let procentDepression =
      total > 0 ? ((antalDepression / total) * 100).toFixed(1) + "%" : "0%";

    drawGoogleChart({
      type: "PieChart",
      container: "chartContainer",
      data: [
        ["Status", "Antal"],
        ["Depression", antalDepression],
        ["Ingen depression", ingenDepression],
      ],
      options: {
        title: `Andel depression (${genderFilter}, ${cityFilter})`,
        height: 400,
        is3D: true,
        pieSliceText: "percentage",
        tooltip: { text: "percentage" },
        legend: { position: "right" },
        slices: {
          0: { color: "#3366cc" },
          1: { color: "#dc3912" },
        },
      },
    });

    document.getElementById("chartText").innerHTML = `
      <p>Diagrammet visar andelen deltagare som rapporterat depression baserat på urvalet. För närvarande är andelen med depression ${procentDepression}.
      Detta kan indikera psykisk hälsa i populationen, men vi bör överväga om vissa grupper (exempelvis kvinnor eller vissa städer) har högre andel än andra.</p>
    `;
  }

  updateChart();

  let ages = data.map((x) => Number(x.Age)).filter((x) => !isNaN(x));

  drawGoogleChart({
    type: "Histogram",
    container: "normalDistContainer",
    data: [["Age"], ...ages.map((age) => [age])],
    options: {
      title: "Histogram över ålder",
      legend: { position: "none" },
      height: 400,
    },
  });

  document.getElementById("normalDistText").innerHTML = `
    <p>Histogrammet visar åldersfördelning hos deltagarna. Fördelningen verkar koncentrerad kring 20-30 år vilket är väntat för en studentpopulation.
    Visuellt ser det ut som en skev fördelning snarare än en perfekt normalfördelning, vilket kan påverka vissa statistiska analyser.</p>
  `;

  let correlationData = data
    .map((x) => [Number(x.StudySatisfaction), Number(x.CGPA)])
    .filter(([a, b]) => !isNaN(a) && !isNaN(b));

  let meanX =
    correlationData.reduce((sum, v) => sum + v[0], 0) / correlationData.length;
  let meanY =
    correlationData.reduce((sum, v) => sum + v[1], 0) / correlationData.length;
  let numerator = correlationData.reduce(
    (sum, [x, y]) => sum + (x - meanX) * (y - meanY),
    0
  );
  let denominator = Math.sqrt(
    correlationData.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0) *
      correlationData.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0)
  );
  let correlationCoeff = numerator / denominator;

  drawGoogleChart({
    type: "ScatterChart",
    container: "correlationContainer",
    data: [["StudySatisfaction", "CGPA"], ...correlationData],
    options: {
      title: `Korrelation mellan StudySatisfaction och CGPA (r ≈ ${correlationCoeff.toFixed(
        2
      )})`,
      height: 400,
      hAxis: { title: "StudySatisfaction" },
      vAxis: { title: "CGPA" },
    },
  });

  document.getElementById("correlationText").innerHTML = `
    <p>Korrelationen (r ≈ ${correlationCoeff.toFixed(2)}) indikerar ${
    Math.abs(correlationCoeff) < 0.3 ? "ett svagt" : "ett måttligt/starkt"
  } samband mellan StudySatisfaction och CGPA.
    Det låga värdet tyder på att andra faktorer kan spela större roll för betyg än studietillfredsställelse ensam.
    Därför bör vi undersöka ytterligare variabler för att förstå sambanden bättre.</p>
  `;

  document.getElementById("summaryText").innerHTML = `
    <p>Sammanfattningsvis visar analysen att psykisk hälsa bland studenter påverkas av flera faktorer.
    Även om andelen med rapporterad depression är ${procentDepression}, tyder den svaga korrelationen mellan studietillfredsställelse och akademiska resultat på att psykisk ohälsa inte direkt kopplas till betyg.
    För framtida studier bör vi inkludera fler psykosociala faktorer, samt undersöka hur stödresurser på universitetet kan minska psykisk ohälsa och öka välbefinnandet hos studenter.</p>
  `;
})();
