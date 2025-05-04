let data = await dbQuery("SELECT * FROM studen");

// Rubrik
addMdToPage(`## Jämförelse mellan kvinnor och män

Här jämför vi psykisk hälsa mellan kvinnor och män baserat på enkätdata.
`);

// Visa skillnad i depression (antal personer med depression per kön)
let kvinnorMedDepression = data.filter(
  (x) => x.Gender == "Female" && Number(x.Depression) == 1
).length;
let mänMedDepression = data.filter(
  (x) => x.Gender == "Male" && Number(x.Depression) == 1
).length;

let totKvinnor = data.filter((x) => x.Gender == "Female").length;
let totMän = data.filter((x) => x.Gender == "Male").length;

let procentKvinnorDepression =
  totKvinnor > 0 ? (kvinnorMedDepression / totKvinnor) * 100 : 0;
let procentMänDepression = totMän > 0 ? (mänMedDepression / totMän) * 100 : 0;

drawGoogleChart({
  type: "ColumnChart",
  data: [
    ["Kön", "Procent med depression"],
    ["Kvinnor", procentKvinnorDepression],
    ["Män", procentMänDepression],
  ],
  options: {
    title: "Andel deltagare med depression per kön",
    height: 400,
    legend: { position: "none" },
    vAxis: { minValue: 0, maxValue: 100, format: "#'%'" }, // procent på axeln
  },
});

// Visa medelvärde av StudySatisfaction per kön (som procent)
let meanStudySatisfactionKvinnor = s.mean(
  data
    .filter((x) => x.Gender == "Female")
    .map((x) => Number(x.StudySatisfaction))
);
let meanStudySatisfactionMän = s.mean(
  data.filter((x) => x.Gender == "Male").map((x) => Number(x.StudySatisfaction))
);

let meanStudySatisfactionKvinnorProcent = meanStudySatisfactionKvinnor
  ? (meanStudySatisfactionKvinnor * 100).toFixed(1) + "%"
  : "Ingen data";
let meanStudySatisfactionMänProcent = meanStudySatisfactionMän
  ? (meanStudySatisfactionMän * 100).toFixed(1) + "%"
  : "Ingen data";

addToPage(`<pre>
Medelvärde av studiesatisfaktion (i procent):
  Kvinnor: ${meanStudySatisfactionKvinnorProcent}
  Män: ${meanStudySatisfactionMänProcent}
</pre>`);
