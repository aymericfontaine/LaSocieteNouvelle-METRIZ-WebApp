// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// Utils

import { getShortCurrentDateString } from "../../utils/Utils";
import { getAnalyse, getStatementNote } from "../../utils/Writers";
import { SIGtableBody } from "./utils/SIGtableBody";
import { loadFonts } from "./utils/utils";

// Lib
import divisions from "/lib/divisions";

// --------------------------------------------------------------------------
//  Indice Indicator Report
// --------------------------------------------------------------------------
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const createIndicReport = (
  year,
  legalUnit,
  indic,
  label,
  unit,
  financialData,
  impactsData,
  comparativeData,
  download
) => {
  // ---------------------------------------------------------------
  // Utils : Text Generation

  const statementNotes = getStatementNote(impactsData, indic);

  const analysisNotes = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic
  );

  // ---------------------------------------------------------------
  // Get chart canvas and encode it to import in document

  const canvasProduction = document.getElementById("production-" + indic);
  const canvasValueAdded = document.getElementById("netValueAdded-" + indic);
  const canvasIntermediateConsumption = document.getElementById(
    "intermediateConsumption-" + indic
  );
  const canvasFixedCapitalConsumption = document.getElementById(
    "capitalConsumption-" + indic
  );

  const productionChartImage = canvasProduction.toDataURL("image/png");
  const canvasIntermediateConsumptionImage =
    canvasIntermediateConsumption.toDataURL("image/png");
  const canvasValueAddedImage = canvasValueAdded.toDataURL("image/png");
  const canvasFixedCapitalConsumptionImage =
    canvasFixedCapitalConsumption.toDataURL("image/png");

  // ---------------------------------------------------------------
  // Document Property

  const margins = {
    top: 50,
    bottom: 50,
    left: 40,
    right: 40,
  };
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };

  const documentTitle =
    "Rapport_" +
    year +
    "_" +
    legalUnit.replaceAll(" ", "") +
    "-" +
    indic.toUpperCase();

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    header: {
      columns: [
        { text: legalUnit, margin: [20, 15, 0, 0], bold: true },
        {
          text: "Exercice  " + year,
          alignment: "right",
          margin: [0, 15, 20, 0],
          bold: true,
        },
      ],
    },
    footer: function () {
      return {
        columns: [
          {
            text: "Edité le " + getShortCurrentDateString(),
            margin: [20, 25, 0, 0],
            font: "Raleway",
            fontSize: 7,
          },
        ],
      };
    },

    background: function () {
      return {
        canvas: [
          // Background
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 595.28,
            h: 841.89,
            color: "#f1f0f4",
          },
          {
            type: "rect",
            x: margins.left - 20,
            y: margins.top - 15,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 15,
            color: "#FFFFFF",
            r: 10,
          },
        ],
      };
    },
    info: {
      label: documentTitle,
      author: legalUnit,
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: "Résultat - " + label, style: "header" },
      //--------------------------------------------------
      {
        text: "Empreintes de vos Soldes Intermédiaires de Gestion",
        style: "h2",
        margin: [0, 10, 0, 20],
      },
      // SIG Table
      {
        style: "table",
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: SIGtableBody(
            financialData.aggregates,
            indic,
            unit,
            financialData.getIntermediateConsumptionsAggregates(),
            financialData.getFixedCapitalConsumptionsAggregates()
          ),
        },
        layout: {
          hLineWidth: function (i, node) {
            return i === 0 ||
              i === 4 ||
              i === 10 ||
              i === 13 ||
              i === node.table.body.length
              ? 1
              : 0;
          },

          vLineWidth: function (i, node) {
            return i === 0 || i === node.table.widths.length ? 1 : 0;
          },
          vLineColor: function (i, node) {
            return i === 0 || i === node.table.widths.length ? "#f0f0f8" : "";
          },
          hLineColor: function (i, node) {
            return i === 0 ? "" : "#f0f0f8";
          },
        },
      },
      //--------------------------------------------------
      { text: "Impacts directs", style: "h2", margin: [0, 10, 0, 10] },
      statementNotes.map((note) => note),
      { text: impactsData.comments[indic], margin: [0, 10, 0, 10] },

      // ---------------------------------------------------------------------------
      //  PAGE 2
      {
        text: "Analyse - " + label,
        style: "header",
        pageBreak: "before",
      },
      // Analysis note

      { text: "Note d'analyse", style: "h2", margin: [0, 10, 0, 10] },
      analysisNotes.map((note) => ({ text: note, style: "text", fontSize: 9 })),
      // ---------------------------------------------------------------------------
      // Charts
      {
        text: "Comparaisons",
        style: "h2",
        margin: [0, 30, 0, 10],
      },
      comparativeData.activityCode !== "00"
        ? {
            text:
              "Branche d'activité : " + divisions[comparativeData.activityCode],
            margin: [0, 0, 0, 10],
            font: "Raleway",
          }
        : "",
      {
        columns: [
          {
            stack: [
              { text: "Production ", style: "h4" },
              {
                image: productionChartImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
              },
            ],
          },
          {
            stack: [
              {
                text: "Valeur ajoutée",
                style: "h4",
              },
              {
                image: canvasValueAddedImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
              },
            ],
          },
        ],
      },
      {
        columns: [
          {
            stack: [
              {
                text: "Consommations intermédiaires ",
                style: "h4",
              },
              {
                image: canvasIntermediateConsumptionImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
              },
              ///
              {
                table: {
                  widths: [1, "*"],
                  heights: [4, 4, 4, 4],
                  body: [
                    [
                      {
                        text: "",
                        fillColor: "#b0b9f7",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Valeur pour la France",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#d7dcfb",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Objectifs 2030 pour la France",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#ffb642",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Valeur pour la branche",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#ffdc8d",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Objectifs 2030 pour la branche",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                  ],
                  layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 2 : 1;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 2 : 1;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? "white"
                        : "white";
                    },
                    vLineColor: function (i, node) {
                      return i === 0 || i === node.table.widths.length
                        ? "white"
                        : "white";
                    },
                  },
                },
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommations de capital fixe ",
                style: "h4",
              },
              {
                image: canvasFixedCapitalConsumptionImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
              },
            ],
          },
        ],
      },
    ],
    // ---------------------------------------------------------------------------
    // Style
    defaultStyle: {
      fontSize: 10,
      color: "#191558",
    },
    styles: {
      header: {
        fontSize: 16,
        font: "Raleway",
        color: "#191558",
        bold: true,
        margin: [0, 5, 0, 10],
      },
      h2: {
        fontSize: 14,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
      },
      h3: {
        fontSize: 12,
        font: "Raleway",
        color: "#191558",
        bold: true,
        margin: [0, 0, 0, 10],
      },
      h4: {
        fontSize: 10,
        font: "Raleway",
        margin: [0, 10, 0, 10],
        bold: true,
      },
      text: {
        alignment: "justify",
        lineHeight: 1.5,
      },
      table: {
        alignment: "right",
        fontSize: 9,
        margin: [0, 0, 0, 10],
      },
      tableHeader: {
        fillColor: "#f0f0f8",
        bold: true,
        margin: [0, 5, 0, 5],
        color: "#191558",
        alignment: "center",
      },
      tableBold: {
        bold: true,
        alignment: "left",
      },
      tableLeft: {
        alignment: "left",
      },
      legendText: {
        fontSize: 7,
        margin: [0, 10, 0, 0],
      },
    },
  };

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      if (download) {
        saveAs(blob, `${documentTitle}.pdf`);
      }
      resolve(blob);
    });
  });
};
