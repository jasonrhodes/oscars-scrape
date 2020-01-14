const axios = require("axios").default;
const cheerio = require("cheerio");

function printOscars(num) {
  const suffix = getSuffix(num);
  axios
    .get(`https://en.wikipedia.org/wiki/${num}${suffix}_Academy_Awards`)
    .then(result => {
      const $ = cheerio.load(result.data);
      const table = $(".wikitable").first();

      if (num >= 59) {
        printDataByAward(num, suffix, table, $);
      } else {
        printDataByRow(num, suffix, table, $);
      }
    })
    .catch(err => {
      console.log("ERROR");
      console.log(err);
    });
}

function printDataByAward(num, suffix, table, $) {
  const awards = table.find("tbody tr td");

  awards.each((i, award) => {
    const award_name = $(award)
      .find("div > b > a")
      .text();
    const nominees = $(award).find("ul li");

    nominees.each((i, nom) => {
      const status = i === 0 ? "winner" : "nominee";
      const links = $(nom).find("a");
      console.log(
        [
          `${num}${suffix} Academy Awards`,
          num + 1927,
          cleanWS(award_name),
          status,
          cleanWS(links.eq(0).text()),
          cleanWS(links.eq(1).text())
        ].join("|")
      );
    });
  });
}

function printDataByRow(num, suffix, table, $) {
  const rows = table.find("tr");
  let awards = [];
  let allNominees = [];

  rows.each((i, row) => {
    const headers = $(row).find("th");
    if (headers.length > 0) {
      headers.each((i, header) => awards.push(header));
    } else {
      if (num === 58 && i === 0) {
        console.log("found problem row");
        const headers = $(row).find("td > div");
        console.log(headers.length, "headers found");
        headers.each((i, header) => awards.push(header));
      }

      const cells = $(row).find("td");
      cells.each((i, cell) => allNominees.push(cell));
    }
  });

  if (awards.length !== allNominees.length) {
    throw new Error(
      `Problem with trying to find awards and nominees for ${num}${suffix} awards ... found ${awards.length} awards and ${allNominees.length} nominees`
    );
  }

  awards.forEach((award, i) => {
    const award_name = $(award)
      .find("a")
      .text();

    const nominees = $(allNominees[i]).find("ul li");

    nominees.each((i, nom) => {
      const status = i === 0 ? "winner" : "nominee";
      const links = $(nom).find("a");
      console.log(
        [
          `${num}${suffix} Academy Awards`,
          num + 1927,
          cleanWS(award_name),
          status,
          cleanWS(links.eq(0).text()),
          cleanWS(links.eq(1).text())
        ].join("|")
      );
    });
  });
}

function cleanWS(text) {
  return text.replace("\n", " ").replace(/\s+/g, " ");
}

function getSuffix(num) {
  const finalDigit = num
    .toString()
    .split("")
    .pop();

  switch (finalDigit) {
    case "1":
      return "st";
    case "2":
      return "nd";
    case "3":
      return "rd";
    default:
      return "th";
  }
}

console.log(
  ["Ceremony", "Year", "Award", "Status", "Name", "Extra Note"].join("|")
);

// printOscars(59);

for (let i = 20; i <= 91; i++) {
  printOscars(i);
}
