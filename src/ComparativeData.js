// La Société Nouvelle

// API
import api from "/config/api";
// Lib
import divisionIndustryMapping from "/lib/division_industry";

// ################################################## COMPARATIVE DATA OBJECT ##################################################

/** Structure :
 *  ----------------------------------------------------------------------------------------------------
 *    aggregate {}                  production, netValueAdded,...
 *       |- scale {}                area, division
 *           |- serie {}            history, trend, target
 *               |- .data {}        ...indics
 *                   |- indic []    array with data
 *               |- .label          label of serie
 *  ----------------------------------------------------------------------------------------------------
 * 
 */

const metaAggregates = {
  production: "PRD",
  intermediateConsumptions: "IC",
  fixedCapitalConsumptions: "CFC",
  netValueAdded: "NVA"
};

const metaScales = [
  "area",
  "division"
];

const metaSeries = {
  "history": { enpoint: "macro_fpt" },
  "trend":   { enpoint: "macro_fpt_trd" },
  "target":  { enpoint: "macro_fpt_tgt" }
};

export class ComparativeData {

  constructor(props) {
    props = props || {};

    // division
    this.comparativeDivision = props.comparativeDivision || "00";

    // aggregates dataset

    for (let aggregate of Object.keys(metaAggregates)) {
      this[aggregate] = {};
      for (let scale of metaScales) {
        this[aggregate][scale] = {};
        for (let serie of Object.keys(metaSeries)) {
          this[aggregate][scale][serie] = {
            label: props[aggregate]?.[scale]?.[serie]?.label || "",
            data: props[aggregate]?.[scale]?.[serie]?.data || {},
          };
        }
      }
    }
  }

  fetchComparativeData = async (indics) => {
    try {

      const divisions =
        this.comparativeDivision && this.comparativeDivision != "00"
          ? ["TOTAL", divisionIndustryMapping[this.comparativeDivision]]
          : ["TOTAL"];
      const aggregates = Object.values(metaAggregates);
  
      // params
      const params = {
        aggregates,
        divisions,
        indics,
      };
      console.log('params', params);
      // fetch data
      const [history, trend, target] = await Promise.all([
        this.fetchMacrodata(metaSeries.history.enpoint, params),
        this.fetchMacrodata(metaSeries.trend.enpoint, params),
        this.fetchMacrodata(metaSeries.target.enpoint, params),
      ]);



      // add data
      for (const [serie, dataset] of Object.entries({ history, target, trend })) {
        for (let [aggregate, aggregateKey] of Object.entries(metaAggregates)) {
          for (let division of divisions) {
            let scale = (division == "TOTAL") ? "area" : "division";
     
            for (let indic of indics) {             
              let data = dataset
                .filter(
                  (item) =>
                    item.industry == division &&
                    item.aggregate == aggregateKey &&
                    item.indic == indic.toUpperCase()
                )
                .sort((a, b) => a.year - b.year);
              this[aggregate][scale][serie].data[indic] = data;           
            }
          };

          if (divisions.length==1 && divisions[0]=="TOTAL") {
            this[aggregate].division = {
              ...this[aggregate].area
            };
          }     
             
        }
      }
    } catch (error) {
      throw Error(error.message);
    }
  };

  fetchMacrodata = async (endpoint, params) => {
    try {
      // Dataset metadata
      const metadata = await this.fetchDatasetMetadata(endpoint);

      // Filter parameters based on available metadata
      const { filteredIndics, filteredDivisions, filteredAggregates } = getAvailableParams(params, metadata);
      
      const response = await api.get(`/macrodata/${endpoint}`, {
        params: {
          industry: filteredDivisions.join(" "),
          aggregate: filteredAggregates.join(" "),
          indic: filteredIndics.map((indic) => indic.toUpperCase()).join(" "),
          country: "FR",
        },
      });
 
      if (response.status === 200 && response.data.header.code === 200) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      throw Error(error.message);
    }
  };

  fetchDatasetMetadata = async (endpoint) => {
    try {
      const metadataResponse = await api.get(`/macrodata/metadata/${endpoint}`);
      if (
        metadataResponse.status === 200 &&
        metadataResponse.data.header.code === 200
      ) {
        const metadata = metadataResponse.data.metadata;
        return metadata;
      } else {
        throw new Error("Metadata request failed.");
      }
    } catch (error) {
      console.error("Error fetching metadata:", error.message);
      throw error; 
    }
  };
}

const getAvailableParams = (params, metadata) => {

  const {
    divisions,
    aggregates,
    indics
  } = params;

  const availableIndics = metadata.indic.map((indic) => indic.code);
  const availableIndustries = metadata.industry.map((industry) => industry.code);
  const availableAggregates = metadata.aggregate.map((aggregate) => aggregate.code);

  const filteredIndics = indics.filter((indic) =>
    availableIndics.includes(indic.toUpperCase())
  );
  const filteredDivisions = divisions.filter((division) =>
    availableIndustries.includes(division)
  );
  const filteredAggregates = aggregates.filter((aggregate) =>
    availableAggregates.includes(aggregate)
  );

  return {
    filteredIndics,
    filteredDivisions,
    filteredAggregates
  };

}