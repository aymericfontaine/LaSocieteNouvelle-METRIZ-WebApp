// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Select from "react-select";

// Chart
import { TrendChart } from "../charts/TrendChart";

// Lib
import metaTargets from "/lib/target";
import metaTrends from "/lib/trend.json";

// Styles
import { customSelectStyles } from "/config/customStyles";
import { formatDateFR } from "../../../../utils/periodsUtils";

// Modals
import { Loader } from "../../../modals/Loader";

/* ---------- EVOLUTION CURVES VISUAL ---------- */

/** Component to visualize evolution of footprint over years (legal unit & comparative division)
 *
 *  Props :
 *    - session
 *    - indic
 *  (no period -> show on all year periods)
 *
 *  Params (in component) :
 *    - aggregate
 *
 */

const graphOptions = [
  { label: "Production", value: "production" },
  { label: "Consommations intermédiaires", value: "intermediateConsumptions" },
  { label: "Consommations de capital fixe", value: "fixedCapitalConsumptions" },
  { label: "Valeur ajoutée nette", value: "netValueAdded" },
];

export const EvolutionCurvesVisual = ({ session, indic, period }) => {
  const { comparativeData } = session;

  const [showedAggregate, setShowedAggregate] = useState("production");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setShowedAggregate("production");
  }, [indic]);

  // --------------------------------------------------

  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  // --------------------------------------------------

  const updateComparativeData = async () => {
    setIsLoading(true);
    await session.comparativeData.fetchComparativeData(
      session.validations[period.periodKey]
    );
    setIsLoading(false);
  };

  const title = "";

  return (
    <Row>
      <Col lg={8}>
        <div id="evolution" className="box ">
          <h4>Courbes d'évolution</h4>
          <Select
            styles={customSelectStyles}
            className="mb-4"
            value={graphOptions.find(
              (option) => option.value == showedAggregate
            )}
            options={graphOptions}
            onChange={changeShowedAggregate}
          />
          <div>
            <h5>{title}</h5>
            <TrendChart
              id={`trend-${showedAggregate.value}-${indic}`}
              session={session}
              datasetOptions={{
                aggregate: showedAggregate,
                indic,
              }}
              printOptions={{
                printMode: false,
              }}
            />
          </div>
          <hr></hr>
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div>
              <h6>Dernière actualisation :</h6>
              <div className="small d-flex align-items-center">
                <p className="mb-0">
                  {" "}
                  Tendance de la branche :
                  {formatDateFR(
                    comparativeData.production.division.trend.data[indic][0]
                      .lastupdate
                  )}
                </p>
                {comparativeData.production.division.target.data[indic].length >
                  0 && (
                  <p className="mb-0 ms-2">
                    Objectif de la branche :
                    {formatDateFR(
                      comparativeData.production.division.target.data[indic][0]
                        ?.lastupdate
                    )}
                  </p>
                )}
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={updateComparativeData}>
              <i className="bi bi-arrow-repeat"></i> Actualiser les données de
              la branche
            </Button>
          </div>
        </div>
      </Col>

      <Col>
        <div className="box ">
          <h4>Notes</h4>
          {comparativeData.production.division.trend.data[indic] && (
            <>
              <h5>Tendance de la branche :</h5>
              <p className="small-text">
                La courbe de tendance correspond à une projection des empreintes
                observées sur les dix dernières années. Les valeurs actuelles
                s'appuient sur l’hypothèse d’une structure macroéconomique
                inchangée. Des travaux sont en cours pour proposer des valeurs
                tenant compte de l’évolution tendancielle de la structure de
                l'économie nationale, ses interactions avec l’extérieur et de la
                dynamique des prix par branche.
              </p>
              <p className="small mt-3 mb-0">
                Source : {metaTrends[indic].source}
              </p>
            </>
          )}
          {comparativeData.production.division.target.data[indic].length >
            0 && (
            <>
              <h5 className="mt-4">Objectif de la branche :</h5>
              {metaTargets[indic].info}
              <p className="small mt-3  mb-0">
                Source : {metaTargets[indic].source}
              </p>
            </>
          )}
        </div>
      </Col>
      {isLoading && (
        <Loader title={"Récupération des données de comparaison ..."} />
      )}
    </Row>
  );
};
