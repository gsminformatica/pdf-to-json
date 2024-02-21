'use strict';

const { PdfReader } = require('pdfreader');

function readPDFPages (buffer, reader=(new PdfReader())) {

  return new Promise((resolve, reject) => {
    let pages = [];
    reader.parseBuffer(buffer, (err, item) => {

      if (err)
        reject(err)

      else if (!item)
        resolve(pages);

      else if (item.page)
        pages.push({});

      else if (item.text) {
        const row = pages[pages.length-1][item.y] || [];
        row.push(item.text);
        pages[pages.length-1][item.y] = row;
      }

    });
  });

}

function parseBill (pages) {

  const page = pages[0]; // We know there's only going to be one page

  // Declarative map of PDF data that we expect, based on Todd's structure
  const fields = {
    IV: { row: '28.947', index: 0 },
    GSV: { row: '29.697', index: 0 },
  };

  const data = {};

  // Assign the page data to an object we can return, as per
  // our field specification
  Object.keys(fields)
    .forEach((key) => {

      const field = fields[key];
      const val = page[field.row][field.index];

      // We don't want to lose leading zeros here, and can trust
      // any backend / data handling to worry about that. This is
      // why we don't coerce to Number.
      data[key] = val;

    });

  // Manually fixing up some text fields so theyre usable
  //data.reqID = data.reqID.slice('Requsition ID: '.length);
  //data.date = data.date.slice('Date: '.length);

  return data;

}

module.exports = async function parse (buf, reader) {

  const data = await readPDFPages(buf, reader);
  //console.log({'beforeParse': data});
  const parsedData = parseBill(data);  
  //return data;
  return parsedData;

};