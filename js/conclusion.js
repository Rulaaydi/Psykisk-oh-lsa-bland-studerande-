let data = await dbQuery("SELECT * FROM studen");

if (!data || data.length === 0) {
  addMdToPage(`## Slutsats


⚠️ Ingen data hittades i databasen!
`);
} else {
  let total = data.length;
  let antalDepression = data.filter((x) => Number(x.Depression) == 1).length;
  let procentDepression = ((antalDepression / total) * 100).toFixed(1);

  addMdToPage(`## Slutsats


Analysen visar att **${procentDepression}%** av deltagarna rapporterar depressiva symptom.


Det är viktigt att universitet erbjuder stöd och resurser för att minska akademisk press och förbättra den psykiska hälsan hos studenter.


Medelvärden och typvärden visar vissa skillnader mellan kvinnor och män.
`);

  // Pie chart som visar procent
  drawGoogleChart({
    type: "PieChart",
    data: [
      ["Status", "Antal"],
      ["Depression", antalDepression],
      ["Ingen depression", total - antalDepression],
    ],
    options: {
      title: "Andel deltagare med/utan depression",
      height: 400,
      is3D: true,
      pieSliceText: "percentage", // visar procent direkt på tårtbiten
      tooltip: { trigger: "focus" },
      slices: {
        0: { color: "#e0440e" }, // färg för depression
        1: { color: "#0eac51" }, // färg för ingen depression
      },
    },
  });
}
